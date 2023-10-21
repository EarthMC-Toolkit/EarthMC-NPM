export class BaseEntity {
    name: string
    uuid: string

    constructor(data: { name: string; uuid: string }) {
        this.name = data.name
        this.uuid = data.uuid
    }
}