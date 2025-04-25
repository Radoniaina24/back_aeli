
function globalErrHandler(err, req, res, next) {
    const stack = err?.stack
    const message = err?.message
    const status = err?.statusCode ? err?.statusCode : 500
    res.status(status).json({
        stack, message
    })
}
function notFound(req, res, next){
    const error = new Error(`Route ${req.originalUrl} not found`)
    next(error)
}
module.exports = {
    globalErrHandler,
    notFound
};