import { getDb } from '../services/mongodb.service.mjs';
import log from '../services/logger.service.mjs';

/**
 * @description This looper class runs every hour and removes registered accounts that
 * haven't been activated in 24 hours since registration.
 * Runs at server startup.
 */
class RemoveAccountLoop {
    static name = 'Remove Inactivated Account';

    static interval = 1000 * 60 * 60; // run every hour

    static async execute() {
        log.debug(`[Loop]: [ Executing Remove Inactivated Account looper. ]`);

        const expiredAccounts = await getDb()
            .collection('users')
            .find(
                { $and: [{ isAccountActivated: false }, { activateAccountExpires: { $lt: Date.now() } }] },
                { projection: { id: 1, username: 1, email: 1 } }
            )
            .toArray();

        if (expiredAccounts.length) {
            log.info(`Found ${expiredAccounts.length} expired accounts. Will remove them in a second...`);

            for (const account of expiredAccounts) {
                log.info(`Removing expired account for user: ${account.username}, email: ${account.email}`);
                await getDb().collection('users').deleteOne({ id: account.id });
            }
        } else {
            log.info(`No expired account found this iteration... moving on`);
        }
    }
}

export default RemoveAccountLoop;
