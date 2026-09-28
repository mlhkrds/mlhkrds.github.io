import { domMax } from 'motion/react';

// Loaded after first paint; domMax (not domAnimation) because the nav pill needs layout animations.
export default domMax;
