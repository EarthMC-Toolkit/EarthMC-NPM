import { RawFlagPerms, RawResidentPerms } from '../types.js'

export type Resident = {
    name: string
    town: string
    nation?: string
    rank: string
}

export type ApiResident = {
    name: string
    title: string
    surname: string
    town?: string
    nation?: string
    balance: number
    online: boolean
    timestamps?: {
        joinedTownAt?: number
        registered: number
        lastOnline: number
    }
    townRanks: ResidentRanks
    nationRanks: ResidentRanks
    perms?: {
        build: RawResidentPerms
        destroy: RawResidentPerms
        switch: RawResidentPerms
        itemUse: RawResidentPerms
        flags: RawFlagPerms
    }
    friends?: string[]
}

type ResidentRanks = {
    ranks?: { [key: string]: string[] }
}