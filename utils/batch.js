module.exports = {
  reduceInBatch
}

/**
 * Perform an action on array of data in batches without blocking for long.
 * After processing each batch it will yeild the control to event loop.
 * @param {any[]} data input data array to be processed in batch
 * @param {(res: any, data: any[])} callback will be called sequencially with data slices and last result
 * @param {object} options Options
 * @param {number} options.batchSize Batch size. Default value is 100
 * @param {any} options.initialValue initial value for creating the result
 * @returns any
 */
async function reduceInBatch(data, callback, options) {
  const { batchSize = 100, initialValue } = options || {}
  let processedTill = 0
  let res = initialValue

  while (processedTill < data.length) {
    const batch = data.slice(processedTill, processedTill + batchSize)
    processedTill += batchSize

    await new Promise(resolve => {
      res = callback(initialValue, batch)
      resolve()
    })
  }

  return res
}
