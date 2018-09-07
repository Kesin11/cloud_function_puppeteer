export class Dispatcher {
  callback?: (property: string, args: any[]) => Promise<any>
  constructor() {
    this.callback = undefined
  }
  async dispatch(property: string, args: any[]) {
    console.log(property, args)
    if (this.callback === undefined) return
    return await this.callback(property, args)
  }
  on(callback: (property: string, args: any[]) => Promise<any>) {
    this.callback = callback
  }
}