const logsLocation = global.LOGS_LOCATION || './logs/';
import { execSync } from 'child_process';
import util from 'util';
import fs from 'fs';

const logStdout = process.stdout;
const config = {
    logFileSizeLimit: 10, // MB
    maxNumberOfArchives: 20
};

const map = new Map();

const logTypes = {
    debug: 'DEBUG',
    info: 'INFO',
    warn: 'WARN',
    error: 'ERROR'
};

class Logger {
    static init = () => {
        if (!fs.existsSync(logsLocation)) {
            fs.mkdirSync(logsLocation, { recursive: true });
        }

        if (!fs.existsSync(`${logsLocation}/debug.log`)) {
            fs.writeFileSync(`${logsLocation}/debug.log`, '');
        }
    };

    static debug(message, location = logsLocation) {
        this.log(logTypes.debug, message, location);
    }

    static info(message, location = logsLocation) {
        this.log(logTypes.info, message, location);
    }

    static warn(message, location = logsLocation) {
        this.log(logTypes.warn, message, location);
    }

    static error(message, location = logsLocation) {
        this.log(logTypes.error, message, location);
    }

    static extractFileNameFromStack = (stackString) => {
        return stackString.substring(stackString.indexOf('///'), stackString.length - 1).slice(3);
    };

    static log = (type, message, location = logsLocation) => {
        // create an empty error to get access to the stack
        const error = new Error('');
        const stackArray = error.stack.split('\n');
        const stackString = stackArray.slice(3, stackArray.length)[0];
        let coloredMessage = '';
        let finalMessage = '';
        let fileName = this.extractFileNameFromStack(stackString);
        let logMetaData = `${new Date().toISOString()} [ ${type} ] ${fileName}`;

        switch (type) {
            case logTypes.debug:
                coloredMessage = `\x1b[37m${logMetaData}`; // cyan
                break;
            case logTypes.error:
                coloredMessage = `\x1b[31m${logMetaData}`; // red
                break;
            case logTypes.warn:
                coloredMessage = `\x1b[33m${logMetaData}`; // yellow
                break;
            case logTypes.info:
                coloredMessage = `\x1b[36m${logMetaData}`; // white
                break;
            default:
                coloredMessage = logMetaData;
        }

        finalMessage = `${coloredMessage} -- ${message}`;

        logStdout.write(util.format(`${finalMessage}\n`));

        // save to file
        if (location && fs.existsSync(location)) {
            if (!map.get(location)) {
                const file = `${location}/debug.log`;
                map.set(location, {
                    stream: fs.createWriteStream(file, { flags: 'a' }),
                    file
                });
            }

            let logInfo = map.get(location);
            let logFileStream = logInfo.stream;

            let msgForFile = `${logMetaData} -- ${message}`;
            logFileStream.write(util.format(`${msgForFile}\n`));

            let logFileSize = fs.statSync(logInfo.file).size / 1000000.0; // MB

            if (logFileSize > config.logFileSizeLimit) {
                try {
                    logMetaData = `${new Date().toISOString()} [ ${
                        logTypes.info
                    } ] Archiving logs, maximum limit size reached`;
                    logStdout.write(util.format(logMetaData) + '\n');

                    for (let i = config.maxNumberOfArchives; i > 0; i--) {
                        let archiveName = `${location}debug${i}.tar.gz`;
                        if (fs.existsSync(archiveName)) {
                            let renamed = `${location}debug${i + 1}.tar.gz`;
                            logMetaData = `${new Date().toISOString()} [ ${
                                logTypes.info
                            } ] - Renaming ${archiveName} to ${renamed}`;
                            logStdout.write(util.format(logMetaData) + '\n');
                            fs.renameSync(archiveName, renamed);
                        }
                    }

                    let archiveName = `${location}debug${config.maxNumberOfArchives + 1}.tar.gz`;
                    try {
                        if (fs.existsSync(archiveName)) {
                            fs.unlinkSync(archiveName);
                        }
                    } catch (err) {
                        logMetaData = `${new Date().toISOString()} [ ${
                            logTypes.info
                        } ] - Error while archiving logs: ${err}. Stack: ${err.stack}`;
                        logStdout.write(util.format(`${logMetaData}\n`));
                    }

                    execSync(`tar -czvf ${`${location}debug1.tar.gz`} -C ${location} debug.log`);
                    execSync(`echo "" > ${logInfo.file}`);
                } catch (err) {
                    logMetaData = `${new Date().toISOString()} [ ${
                        logTypes.error
                    } ] - Error while archiving logs ${err}. Stack: ${err.stack}`;
                    logStdout.write(util.format(`${logMetaData}\n`));
                }
            }
        }
    };
}

Logger.init();

export default Logger;
