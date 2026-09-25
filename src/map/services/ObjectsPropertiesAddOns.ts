declare global {
  interface URLSearchParams {
    remove(key: string, value: string): void
  }
}

/**
 * Remove a given <key, value> pair from the querystring...
 */
URLSearchParams.prototype.remove = function (key: string, value: string) {
  const remaining = this.getAll(key).filter((k) => k !== value)
  this.delete(key)
  remaining.forEach((v) => this.append(key, v))
}

export {}