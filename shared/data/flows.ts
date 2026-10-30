import type { FlowSegment, FlowSpec } from '../utils/flow'

const pulses = (edges: string[], start: number, count: number, every: number): FlowSegment[] =>
  Array.from({ length: count }, (_, pulse) =>
    edges.map((edge, step) => ({
      edge,
      from: start + pulse * every + step * 0.8,
      to: start + pulse * every + (step + 1) * 0.8
    }))
  ).flat()

/** Follows the public release pattern only: no hostnames, addresses, counts, or sizes. */
const release: FlowSpec = {
  name: 'blue-green-release',
  description:
    'Animated diagram. Traffic reaches a load balancer that sends it to the blue environment. A new build goes to the green environment and fails its health check, so traffic stays on blue. A fixed build passes, traffic moves to green, and blue drains and is kept for rollback. Both environments share the same data services.',
  loop: 16.5,
  rest: 16,
  start: 0,
  nodes: [
    { key: 'traffic', label: 'traffic', column: 0, row: 1 },
    { key: 'build', label: 'new build', short: 'build', column: 0, row: 2 },
    { key: 'balancer', label: 'load balancer', short: 'balancer', column: 1, row: 1 },
    { key: 'blue', label: 'blue', column: 2, row: 0 },
    { key: 'green', label: 'green', column: 2, row: 2 },
    { key: 'data', label: 'data services', short: 'data', column: 3, row: 1 }
  ],
  edges: [
    ['traffic', 'balancer'],
    ['balancer', 'blue'],
    ['balancer', 'green'],
    ['blue', 'data'],
    ['green', 'data'],
    ['build', 'green']
  ],
  segments: [
    ...pulses(['traffic-balancer', 'balancer-blue', 'blue-data'], 0.2, 4, 2.2),
    { edge: 'build-green', from: 1.2, to: 2.6 },
    { edge: 'build-green', from: 5.2, to: 6.6 },
    ...pulses(['traffic-balancer', 'balancer-green', 'green-data'], 9, 3, 2.2)
  ],
  events: [
    { t: 0, node: 'traffic', state: 'on' },
    { t: 0, node: 'balancer', state: 'on' },
    { t: 0, node: 'data', state: 'on' },
    {
      t: 0,
      node: 'blue',
      state: 'on',
      label: 'blue live',
      short: 'blue',
      log: 'blue: serving traffic'
    },
    { t: 1.2, node: 'build', state: 'on', log: 'build: release promoted to green' },
    { t: 2.6, node: 'build', state: '' },
    {
      t: 2.6,
      node: 'green',
      state: 'wait',
      label: 'checking',
      log: 'green: health check running'
    },
    { t: 4, node: 'green', state: 'fail', label: 'check failed', short: 'failed' },
    { t: 4, log: 'green: health check failed' },
    { t: 4.3, log: 'balancer: traffic stays on blue' },
    { t: 5.2, node: 'build', state: 'on', log: 'build: fixed release promoted' },
    { t: 5.2, node: 'green', state: '' },
    { t: 6.6, node: 'build', state: '' },
    { t: 6.6, node: 'green', state: 'wait', label: 'checking', log: 'green: health check running' },
    { t: 8, node: 'green', state: 'on', label: 'healthy', log: 'green: health check passed' },
    { t: 8.8, node: 'green', state: 'on', label: 'green live', short: 'green' },
    { t: 8.8, log: 'balancer: traffic moved to green' },
    {
      t: 9.4,
      node: 'blue',
      state: 'wait',
      label: 'draining',
      log: 'blue: finishing open requests'
    },
    { t: 11.6, node: 'blue', state: '', label: 'blue standby', short: 'standby' },
    { t: 11.6, log: 'blue: kept ready for rollback' }
  ]
}

/** Uses only terms already public in the One Pro Suite case study and summary. */
const platform: FlowSpec = {
  name: 'platform-layers',
  description:
    'Animated diagram. A request from agency A passes a shared tenant core, where its tenant and roles are checked, and reaches the quoting module. Quoting calls a single carrier boundary, which hides the differences between carriers. A request from agency B passes the same core and only sees its own data. Types defined by the backend then travel back to the typed interface.',
  loop: 14.5,
  rest: 12.6,
  start: 0,
  nodes: [
    { key: 'ui', label: 'typed ui', short: 'ui', column: 0, row: 1 },
    { key: 'core', label: 'tenant core', short: 'core', column: 1, row: 1 },
    { key: 'intake', label: 'intake', column: 2, row: 0 },
    { key: 'quoting', label: 'quoting', column: 2, row: 1 },
    { key: 'onboarding', label: 'onboarding', short: 'onboard', column: 2, row: 2 },
    { key: 'boundary', label: 'boundary', short: 'api', column: 3, row: 1 },
    { key: 'carriers', label: 'carriers', short: 'carrier', column: 4, row: 1 }
  ],
  edges: [
    ['ui', 'core'],
    ['core', 'intake'],
    ['core', 'quoting'],
    ['core', 'onboarding'],
    ['quoting', 'boundary'],
    ['boundary', 'carriers']
  ],
  segments: [
    { edge: 'ui-core', from: 0.3, to: 1.3 },
    { edge: 'core-quoting', from: 1.4, to: 2.4 },
    { edge: 'quoting-boundary', from: 2.5, to: 3.5 },
    { edge: 'boundary-carriers', from: 3.6, to: 4.6 },
    { edge: 'ui-core', from: 6.2, to: 7.2 },
    { edge: 'core-onboarding', from: 7.3, to: 8.3 },
    { edge: 'core-quoting', from: 10, to: 11, back: true },
    { edge: 'ui-core', from: 11.1, to: 12.1, back: true }
  ],
  events: [
    {
      t: 0.3,
      node: 'ui',
      state: 'on',
      label: 'agency a',
      short: 'team a',
      log: 'agency a: quote request'
    },
    { t: 1.3, node: 'ui', state: '' },
    { t: 1.3, node: 'core', state: 'on', log: 'core: tenant scoped, roles checked' },
    { t: 2.4, node: 'core', state: '' },
    { t: 2.4, node: 'quoting', state: 'on', log: 'quoting: module takes the request' },
    { t: 3.5, node: 'quoting', state: '' },
    { t: 3.5, node: 'boundary', state: 'on', log: 'boundary: same call, every carrier' },
    { t: 4.6, node: 'boundary', state: '' },
    { t: 4.6, node: 'carriers', state: 'on', log: 'carriers: differences stay here' },
    { t: 5.5, node: 'carriers', state: '' },
    { t: 5.5, log: 'audit: request recorded' },
    {
      t: 6.2,
      node: 'ui',
      state: 'on',
      label: 'agency b',
      short: 'team b',
      log: 'agency b: onboarding request'
    },
    { t: 7.2, node: 'ui', state: '' },
    { t: 7.2, node: 'core', state: 'on', log: 'core: agency b sees only its data' },
    { t: 8.3, node: 'core', state: '' },
    { t: 8.3, node: 'onboarding', state: 'on', log: 'onboarding: same core, same rules' },
    { t: 9.4, node: 'onboarding', state: '' },
    { t: 9.4, log: 'modules: 18 share this foundation' },
    { t: 10, node: 'quoting', state: 'on' },
    { t: 11, node: 'quoting', state: '' },
    { t: 11, node: 'core', state: 'on', log: 'types: backend defines the shape' },
    { t: 12.1, node: 'core', state: '' },
    { t: 12.1, node: 'ui', state: 'on', log: 'ui: frontend gets the same types' }
  ]
}

const lifecycle: FlowSpec = {
  name: 'quote-lifecycle',
  description:
    'Animated diagram. An address starts a quote, known details are filled in, and the required fields are checked. The quote then launches to three carriers at once. Two respond. One times out and is retried. All three results then reach the screen, ranked.',
  loop: 14.6,
  rest: 11,
  start: 7.2,
  nodes: [
    { key: 'intake', label: 'intake', column: 0, row: 1 },
    { key: 'prefill', label: 'prefill', column: 1, row: 1 },
    { key: 'launch', label: 'launch', column: 2, row: 1 },
    { key: 'a', label: 'carrier a', short: 'a', column: 3, row: 0 },
    { key: 'b', label: 'carrier b', short: 'b', column: 3, row: 1 },
    { key: 'c', label: 'carrier c', short: 'c', column: 3, row: 2 },
    { key: 'results', label: 'results', column: 4, row: 1 }
  ],
  edges: [
    ['intake', 'prefill'],
    ['prefill', 'launch'],
    ['launch', 'a'],
    ['launch', 'b'],
    ['launch', 'c'],
    ['a', 'results'],
    ['b', 'results'],
    ['c', 'results']
  ],
  segments: [
    { edge: 'intake-prefill', from: 0.3, to: 1.3 },
    { edge: 'prefill-launch', from: 1.4, to: 2.4 },
    { edge: 'launch-a', from: 2.6, to: 3.8 },
    { edge: 'launch-b', from: 2.6, to: 3.8 },
    { edge: 'launch-c', from: 2.6, to: 3.8 },
    { edge: 'c-results', from: 4.6, to: 5.7 },
    { edge: 'a-results', from: 5.6, to: 6.7 },
    { edge: 'launch-b', from: 7.1, to: 8.2 },
    { edge: 'b-results', from: 9.1, to: 10.2 }
  ],
  events: [
    { t: 0.3, node: 'intake', state: 'on', log: 'intake: address accepted' },
    { t: 1.3, node: 'intake', state: '' },
    { t: 1.3, node: 'prefill', state: 'on', log: 'prefill: known details filled in' },
    { t: 2.4, node: 'prefill', state: '' },
    { t: 2.4, node: 'launch', state: 'on', log: 'launch: required fields valid' },
    { t: 3.8, log: 'launch: 3 carriers started' },
    { t: 3.8, node: 'a', state: 'wait' },
    { t: 3.8, node: 'b', state: 'wait' },
    { t: 3.8, node: 'c', state: 'wait' },
    { t: 4.5, node: 'c', state: 'on', log: 'carrier c: quote returned' },
    { t: 5.5, node: 'a', state: 'on', log: 'carrier a: quote returned' },
    {
      t: 5.7,
      node: 'results',
      state: 'on',
      label: 'results 1/3',
      short: '1 of 3',
      log: 'results: 1 of 3 on screen'
    },
    {
      t: 6.5,
      node: 'b',
      state: 'fail',
      label: 'timed out',
      short: 'late',
      log: 'carrier b: timed out, retry 1 of 3'
    },
    { t: 6.7, node: 'results', label: 'results 2/3', short: '2 of 3' },
    { t: 6.7, log: 'results: 2 of 3 on screen' },
    { t: 8.2, node: 'b', state: 'wait' },
    { t: 9, node: 'b', state: 'on', log: 'carrier b: quote returned on retry' },
    { t: 10.2, node: 'results', label: 'results 3/3', short: '3 of 3' },
    { t: 10.2, log: 'results: 3 of 3 ranked' }
  ]
}

export const flows = {
  'blue-green-release': release,
  'platform-layers': platform,
  'quote-lifecycle': lifecycle
} satisfies Record<string, FlowSpec>

export type FlowName = keyof typeof flows

/** The home page tabs, from infrastructure up to the product. */
export const flowTabs: { label: string; flow: FlowName }[] = [
  { label: 'infrastructure', flow: 'blue-green-release' },
  { label: 'platform', flow: 'platform-layers' },
  { label: 'product', flow: 'quote-lifecycle' }
]
