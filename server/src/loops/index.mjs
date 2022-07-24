import inactiveAccountsLoop from './inactiveAccounts.loop.mjs';
import log from '../services/logger.service.mjs';

const loops = [];

// every time you add a new loop, push it into this array
loops.push(inactiveAccountsLoop);

/**
 * @description This function runs at server startup and creates intervals for all
 * imported loops.
 */
export const initLoops = () => {
    for (const loop of loops) {
        log.debug(`Loading ${loop.name} to run every ${+loop.interval / 60 / 60 / 1000} hour(s)`);
        setInterval(loop.execute, loop.interval);
    }
};
