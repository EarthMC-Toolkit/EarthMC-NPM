export class NotFoundError extends Error { 
    constructor(message: string) {
        super(message)

        this.name = "NotFoundError"
        this.message = message
    }
}

export class FetchError extends Error { 
    constructor(message: string) {
        super(message)

        this.name = "FetchError"
        this.message = message
    }
}

export class InvalidError extends Error {
    constructor(message: string) {
        super(message)

        this.name = "InvalidError"
        this.message = message
    }
}

export const NotFound = (input: string) => new NotFoundError(`${input} does not exist.`)
