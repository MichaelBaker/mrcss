import Benchmark      from 'benchmark'
import Selector       from 'selector.es6'
import React          from 'react'
import ReactDOMServer from 'react-dom/server'
import sha1           from 'sha1'

const suite    = new Benchmark.Suite
const results  = { date: new Date(), benchmarks: [] }
let   baseline = 1.0

suite
.add('baseline', () => {
  ReactDOMServer.renderToStaticMarkup(
    <div>
      <div>
        <div>
         Hello
       </div>
        <div>
         Hello
       </div>
        <div>
         Hello
       </div>
        <div>
         Hello
       </div>
        <div>
         Hello
       </div>
        <div>
         Hello
       </div>
        <div>
         Hello
       </div>
     </div>
   </div>
  )
})
.add('three level exact matching', () => {
  const selector = new Selector().add(['span', 'div', 'a'], { color: 'red' })
  const results  = selector.find(['span', 'div', 'a'])
})
.on('cycle', (event) => {
  const { name, hz, stats } = event.target
  if (name === 'baseline') baseline = Math.floor(hz)
  results.benchmarks.push({ id: sha1(name), name, hz: Math.floor(hz), deviation: stats.deviation })
})
.run()

results.benchmarks.forEach((b) => {
  b.percentOfBaseline = (b.hz / baseline) * 100.0
})

console.log(JSON.stringify(results))
