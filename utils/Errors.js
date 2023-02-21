class NotFoundError extends Error { 
    constructor(message) {
        super(message)

        this.name = "NotFoundError"
        this.message = message
    }
}

class FetchError extends Error { 
    constructor(message) {
        super(message);

        this.name = "FetchError"
        this.message = message
    }
}

module.exports = {
    FetchError,
    NotFoundError,
    NotFound: input => new NotFoundError(`${input} does not exist.`)
}