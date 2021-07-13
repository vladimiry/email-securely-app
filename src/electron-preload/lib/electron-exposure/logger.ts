import {LogLevel, Logger} from "src/shared/model/common";
import {ONE_SECOND_MS} from "src/shared/constants";
import {getPlainErrorProps} from "src/shared/util";
import {isProtonApiError, resolveIpcMainApi, sanitizeProtonApiError} from "src/electron-preload/lib/util";

let existingApiClient: ReturnType<typeof resolveIpcMainApi> | undefined;

function log(level: LogLevel, ...args: unknown[]): void {
    const apiClient = existingApiClient ??= resolveIpcMainApi({
        timeoutMs: ONE_SECOND_MS * 3,
        finishPromise: new Promise<void>((resolve) => window.addEventListener("beforeunload", () => resolve)),
    });

    apiClient("log")({level, args}).catch(async () => {
        return apiClient("log")({level, args: args.map((arg) => getPlainErrorProps(arg))}).catch(() => {
            // NOOP
        });
    });
}

const sanitizeLoggedArgument = (arg: unknown): unknown => {
    if (isProtonApiError(arg)) {
        return sanitizeProtonApiError(arg);
    }
    return arg;
};

export const LOGGER: Logger = (["error", "warn", "info", "verbose", "debug", "silly"] as const).reduce(
    (accumulator, level) => {
        const doLog = log.bind(null, level);
        accumulator[level] = (...args: unknown[]) => {
            doLog(...args.map(sanitizeLoggedArgument));
        };
        return accumulator;
    },
    {} as Logger,
);
