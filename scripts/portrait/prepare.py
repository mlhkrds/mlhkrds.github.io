"""Prepare the hero portrait: cutout, depth map and head circle.

Run once locally; the encoded outputs in public/portrait/ are committed.

    python3 -m venv --system-site-packages scripts/portrait/.venv
    scripts/portrait/.venv/bin/pip install "rembg[cpu,cli]==2.0.85"
    scripts/portrait/.venv/bin/python scripts/portrait/prepare.py path/to/photo.jpg
    npm run portrait:assets

Outputs: scripts/portrait/work/{cutout.png,depth.png} and lib/portrait-meta.json.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import cast

import numpy as np
from PIL import Image, ImageOps
from scipy import ndimage

HERE = Path(__file__).resolve().parent
WORK = HERE / "work"
META = HERE.parents[1] / "lib" / "portrait-meta.json"
MAX_SIDE = 2400


def load_photo(path: Path) -> Image.Image:
    image = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
    image.thumbnail((MAX_SIDE, MAX_SIDE), Image.Resampling.LANCZOS)
    return image


def cut_out(image: Image.Image, cutout_path: Path | None) -> Image.Image:
    if cutout_path:
        return ImageOps.exif_transpose(Image.open(cutout_path)).convert("RGBA").resize(image.size, Image.Resampling.LANCZOS)
    from rembg import new_session, remove

    return remove(image, session=new_session("birefnet-portrait"), post_process_mask=True).convert("RGBA")


def estimate_depth(image: Image.Image, alpha: np.ndarray, fake: bool) -> np.ndarray:
    inside = alpha > 0.5
    if fake:
        distance = np.asarray(ndimage.distance_transform_edt(inside), dtype=np.float64)
        ramp = np.linspace(1.0, 0.6, alpha.shape[0])[:, None]
        depth = (distance / max(distance.max(), 1.0)) ** 0.5 * ramp
    else:
        import torch
        from transformers.pipelines import pipeline

        estimator = pipeline(
            "depth-estimation",
            model="depth-anything/Depth-Anything-V2-Small-hf",
            device=0 if torch.cuda.is_available() else -1,
        )
        result = cast(dict[str, Image.Image], estimator(image))
        depth = np.asarray(result["depth"].resize(image.size, Image.Resampling.BICUBIC), dtype=np.float64)

    values = depth[inside]
    low, high = np.percentile(values, 1), np.percentile(values, 99)
    depth = np.clip((depth - low) / max(high - low, 1e-6), 0.0, 1.0)
    depth[~inside] = 0.0
    # Extend the subject's depth past its edge so edge pixels never sample the flat background.
    depth = np.maximum(depth, ndimage.grey_dilation(depth, size=(49, 49)) * ~inside)
    return ndimage.gaussian_filter(depth, sigma=2.0)


def head_circle(alpha: np.ndarray) -> tuple[float, float, float]:
    rows = np.where((alpha > 0.5).any(axis=1))[0]
    top = int(rows[0])
    widths = (alpha > 0.5).sum(axis=1).astype(float)
    search = slice(top + int(0.12 * alpha.shape[0]), top + int(0.45 * alpha.shape[0]))
    neck = search.start + int(np.argmin(widths[search]))
    band = alpha[top:neck] > 0.5
    xs = np.nonzero(band)[1]
    radius = (neck - top) / 2
    return float(xs.mean()), float(top + radius), float(radius * 1.08)


def crop_box(alpha: np.ndarray, pad_ratio: float = 0.03) -> tuple[int, int, int, int]:
    ys, xs = np.nonzero(alpha > 0.02)
    pad = int(pad_ratio * max(alpha.shape))
    return (
        max(int(xs.min()) - pad, 0),
        max(int(ys.min()) - pad, 0),
        min(int(xs.max()) + pad + 1, alpha.shape[1]),
        min(int(ys.max()) + pad + 1, alpha.shape[0]),
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("photo", type=Path)
    parser.add_argument("--cutout", type=Path, help="use an existing transparent PNG instead of rembg")
    parser.add_argument("--fake-depth", action="store_true", help="derive depth from the mask when the model can't run")
    parser.add_argument("--head", help="override the head circle as cx,cy,r in cropped pixels")
    args = parser.parse_args()

    WORK.mkdir(parents=True, exist_ok=True)
    photo = load_photo(args.photo)
    cutout = cut_out(photo, args.cutout)
    # Saved straight away so a later failure can resume with --cutout instead of re-running the model.
    cutout.save(WORK / "cutout-full.png")
    alpha = np.asarray(cutout.getchannel("A"), dtype=np.float64) / 255.0
    depth = estimate_depth(photo, alpha, args.fake_depth)

    box = crop_box(alpha)
    cutout = cutout.crop(box)
    depth = depth[box[1] : box[3], box[0] : box[2]]
    alpha = alpha[box[1] : box[3], box[0] : box[2]]

    cutout.save(WORK / "cutout.png")
    Image.fromarray((depth * 65535).astype(np.uint16)).save(WORK / "depth.png")

    cx, cy, r = [float(v) for v in args.head.split(",")] if args.head else head_circle(alpha)
    meta = {"width": cutout.width, "height": cutout.height, "head": {"cx": round(cx, 1), "cy": round(cy, 1), "r": round(r, 1)}}
    META.write_text(json.dumps(meta, indent=2) + "\n")
    print(json.dumps(meta))


if __name__ == "__main__":
    main()
