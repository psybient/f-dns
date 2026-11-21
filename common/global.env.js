export const appEnv = {
    url: window.location.href,
    domain: /:\/\/([^\/]+)/.exec(window.location.href)[1]
}