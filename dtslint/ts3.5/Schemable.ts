import { Kind, URIS } from 'fp-ts/lib/HKT'
import * as S from '../../src/Schemable'
import { left, right } from 'fp-ts/lib/Either'

interface Schema<A> {
  <S extends URIS>(S: S.Schemable<S> & S.WithLazy<S> & S.WithParse<S> & S.WithUnion<S>): Kind<S, A>
}

function make<A>(f: Schema<A>): Schema<A> {
  return f
}

//
// literals
//
make(S => S.literals(['a'])) // $ExpectType Schema<"a">
make(S => S.literals([1])) // $ExpectType Schema<1>
make(S => S.literals([true])) // $ExpectType Schema<true>
make(S => S.literals([undefined])) // $ExpectType Schema<undefined>
make(S => S.literals([null])) // $ExpectType Schema<null>
make(S => S.literals([null, undefined])) // $ExpectType Schema<null | undefined>

//
// literalsOr
//
make(S => S.literalsOr([undefined], S.type({ a: S.string }))) // $ExpectType Schema<{ a: string; } | undefined>

//
// string
//
make(S => S.string) // $ExpectType Schema<string>

//
// number
//
make(S => S.number) // $ExpectType Schema<number>

//
// boolean
//
make(S => S.boolean) // $ExpectType Schema<boolean>

//
// UnknownArray
//
make(S => S.UnknownArray) // $ExpectType Schema<unknown[]>

//
// UnknownRecord
//
make(S => S.UnknownRecord) // $ExpectType Schema<Record<string, unknown>>

//
// type
//
make(S => S.type({ a: S.string })) // $ExpectType Schema<{ a: string; }>

//
// partial
//
make(S => S.partial({ a: S.string })) // $ExpectType Schema<Partial<{ a: string; }>>

//
// record
//
make(S => S.record(S.number)) // $ExpectType Schema<Record<string, number>>

//
// array
//
make(S => S.array(S.number)) // $ExpectType Schema<number[]>

//
// tuple
//
make(S => S.tuple([S.string])) // $ExpectType Schema<[string]>
make(S => S.tuple([S.string, S.number])) // $ExpectType Schema<[string, number]>

//
// intersection
//
make(S => S.intersection([S.type({ a: S.string }), S.type({ b: S.number })])) // $ExpectType Schema<{ a: string; } & { b: number; }>

//
// sum
//
const S1 = make(S => S.type({ _tag: S.literals(['A']), a: S.string }))
const S2 = make(S => S.type({ _tag: S.literals(['B']), b: S.number }))

// $ExpectType Schema<{ _tag: "A"; a: string; } | { _tag: "B"; b: number; }>
make(S => S.sum('_tag')({ A: S1(S), B: S2(S) }))

//
// lazy
//
interface A {
  a: string
  bs: Array<B>
}
interface B {
  b: number
  as: Array<A>
}
const A: Schema<A> = make(S =>
  S.lazy(() =>
    S.type({
      a: S.string,
      bs: S.array(B(S))
    })
  )
)
const B: Schema<B> = make(S =>
  S.lazy(() =>
    S.type({
      b: S.number,
      as: S.array(A(S))
    })
  )
)

//
// parse
//
// $ExpectType Schema<number>
make(S =>
  S.parse(S.string, s => {
    const n = parseFloat(s)
    return isNaN(n) ? left('NumberFromString') : right(n)
  })
)

//
// union
//
make(S => S.union([S.string, S.number])) // $ExpectType Schema<string | number>