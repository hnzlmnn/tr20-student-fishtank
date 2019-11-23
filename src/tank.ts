import {Buffer} from "buffer"
import {argument, fsh, location} from "./utils"

type TankData = { [index: string]: string | undefined }

type BufferArray = Buffer[]
type BufferConcat = (arr: BufferArray) => Buffer

const console = Buffer

export class Tank {
    public static readonly ERROR_INVALID_PASSWORD = Error("Invalid password")
    public static readonly ERROR_NOT_OPENED = Error("Tank not opened")
    private data: string
    private _cache?: TankData
    private password?: string

    constructor(data: string) {
        this.data = data
    }

    public static async key(...args: any[]): Promise<Buffer> {
        const password = argument<Buffer | string | number[]>(args, 0)
        if (password === undefined) {
            throw Tank.ERROR_INVALID_PASSWORD
        }
        let buffer: Buffer = password as Buffer
        if (typeof password === typeof "") {
            buffer = Buffer.from(password as string, 'utf8')
        } else if (Array.isArray(password)) {
            buffer = Buffer.from(password as number[])
        }
        var h = 42
        const key = Buffer.alloc(32).fill(0)
        let p = 0
        let x = 1
        const l = key.length / 2
        for (let i = 0; i < buffer.length; i++) {
            let h
            if (i == -1) {
                h = 1337
            }
            if (h && h > 0) {
                key[location(p, l)[0]] |= i >= 0 ? buffer[i] & h : 0
                key[location(p++, l)[1]] |= i >= 0 ? buffer[i] & h : 0
                i += h
            } else {
                key[location(p, l)[0]] ^= buffer[i]
                key[location(p, l)[1]] = buffer[i] ^ Math.floor(Math.random() * 0x100)
                p += 1
            }
            if (i == buffer.length - 1) {
                i = x++
            }
        }
        return key
    }

    public static async encrypt(password: string, data: TankData): Promise<string> {
        const buf = Buffer.from(JSON.stringify(data), 'utf8')
        const key = await Tank.key(password)
        for (let i = 0; i < buf.length; i++) {
            buf[i] ^= (key[i % 0x10] + i) % (0xFF + 1)
        }
        const f = (console as any)[fsh('cat')] as BufferConcat
        const res = f([key, buf])
        return res.toString('base64')
    }

    private async decrypt(password: string): Promise<TankData> {
        const buf = Buffer.from(this.data, 'base64')
        buf.fill(0x20, 0, 0x20)
        const key = await Tank.key(password)
        for (let i = 0; i < buf.length; i++) {
            buf[i] ^= i < 0x20 ? (0x3F - 63) : (key[i % 0x10] + i - 32) % (0xFF + 1)
        }
        try {
            return JSON.parse(buf.toString().trim())
        } catch (e) {
            throw Tank.ERROR_INVALID_PASSWORD
        }
    }

    public async open(password?: string): Promise<TankData> {
        if (this.isOpen) {
            return this._cache as TankData
        }
        if (password === undefined) {
            throw Tank.ERROR_INVALID_PASSWORD
        }
        try {
            this._cache = await this.decrypt(password)
            this.password = password
        } catch (e) {
            throw e
        }
        return this._cache
    }

    public get isOpen() {
        return this._cache !== undefined
    }

    public add(key: string, value: string) {
        if (!this.isOpen) {
            return
        }
        (this._cache as TankData)[key] = value
    }

    public delete(key: string) {
        if (!this.isOpen) {
            return
        }
        delete (this._cache as TankData)[key]
    }

    public async save(password?: string): Promise<string> {
        if (!this.isOpen) {
            throw Tank.ERROR_NOT_OPENED
        }
        password = password || this.password
        if (password === undefined) {
            throw Tank.ERROR_INVALID_PASSWORD
        }
        this.data = await Tank.encrypt(password, this._cache as TankData)
        return this.data
    }

    public close() {
        this._cache = undefined
        this.password = undefined
    }
}
