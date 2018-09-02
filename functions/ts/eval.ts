// ローカルでは問題なし
const x: number = eval('2 + 2')
const y = 2
const z = eval('x + y')
console.log(x, y, z)

// 別のコンテキストであってもちゃんと向こうのコンテキストで評価される
class Foo {
  a: number
  b: number
  constructor(a: number, b: number) {
    this.a = a
    this.b = b
  }
  evalCode(code: string) {
    eval(code)
    console.log(`a: ${this.a}, b: ${this.b}`)
  }
}
const foo = new Foo(1, 2)
foo.evalCode('this.a = this.a + this.b')
foo.evalCode('this.a = this.a + this.b')