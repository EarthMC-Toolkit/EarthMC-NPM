class NotFoundError extends Error { 
    constructor(message) {
        super(message);
        this.name = "NotFoundError";
    }
}

class FetchError extends Error { 
    constructor(message) {
        super(message);
        this.name = "FetchError";
    }
}

module.exports = {
    FetchError,
    NotFoundError,
    NotFound: input => new NotFoundError(`${input} does not exist.`),
}