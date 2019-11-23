export function argument<T = any>(args: any[], index: number): T | undefined {
    if (index < 0) {
        return undefined
    }
    if (index >= args.length) {
        return undefined
    }
    return args[index] as T
}

export function location(p: number, l: number) {
    return [p % l, l + (p % l)]
}

export function fsh(...args: any[]): string {
    // @ts-ignore
    return ((ߺ, _)=>(([] + {})[5]+([] + {})[1]+_+ߺ[1]))`${(""[0]+"")[1]}c`+(["42","1337","666"].map(parseInt)[250, 84, 120, 144, 2, 70, 163, 244, 50, 51, 196, 14, 97, 143, 52, 2]+"")[1]+(()=>[]+{}+{}-[]+{})()[9]
}
