import {selector as parseSelector} from 'vega-event-selector';
import {Channel, ScaleChannel, X, Y} from '../../../channel';
import {stringValue} from '../../../util';
import {BRUSH as INTERVAL_BRUSH, projections as intervalProjections} from '../interval';
import {channelSignalName, SelectionComponent} from '../selection';
import {UnitModel} from './../../unit';
import {default as scalesCompiler, domain} from './scales';
import {TransformCompiler} from './transforms';


const ANCHOR = '_translate_anchor';
const DELTA  = '_translate_delta';

const translate:TransformCompiler = {
  has: function(selCmpt) {
    return selCmpt.type === 'interval' && selCmpt.translate;
  },

  signals: function(model, selCmpt, signals) {
    const name = selCmpt.name;
    const hasScales = scalesCompiler.has(selCmpt);
    const anchor = name + ANCHOR;
    const {x, y} = intervalProjections(selCmpt);
    let events = parseSelector(selCmpt.translate, 'scope');

    if (!hasScales) {
      events = events.map((e) => (e.between[0].markname = name + INTERVAL_BRUSH, e));
    }

    signals.push({
      name: anchor,
      value: {},
      on: [{
        events: events.map((e) => e.between[0]),
        update: '{x: x(unit), y: y(unit)' +
          (x !== null ? ', extent_x: ' + (hasScales ? domain(model, X) :
              `slice(${channelSignalName(selCmpt, 'x', 'visual')})`) : '') +

          (y !== null ? ', extent_y: ' + (hasScales ? domain(model, Y) :
              `slice(${channelSignalName(selCmpt, 'y', 'visual')})`) : '') + '}'
      }]
    }, {
      name: name + DELTA,
      value: {},
      on: [{
        events: events,
        update: `{x: ${anchor}.x - x(unit), y: ${anchor}.y - y(unit)}`
      }]
    });

    if (x !== null) {
      onDelta(model, selCmpt, X, 'width', signals);
    }

    if (y !== null) {
      onDelta(model, selCmpt, Y, 'height', signals);
    }

    return signals;
  }
};

export {translate as default};

function onDelta(model: UnitModel, selCmpt: SelectionComponent, channel: ScaleChannel, size: 'width' | 'height', signals: any[]) {
  const name = selCmpt.name;
  const hasScales = scalesCompiler.has(selCmpt);
  const signal:any = signals.filter((s:any) => {
    return s.name === channelSignalName(selCmpt, channel, hasScales ? 'data' : 'visual');
  })[0];
  const anchor = name + ANCHOR;
  const delta  = name + DELTA;
  const sizeSg = model.getSizeSignalRef(size).signal;
  const scaleType = model.getScaleComponent(channel).get('type');
  const sign = hasScales && channel === X ? '-' : ''; // Invert delta when panning x-scales.
  const extent = `${anchor}.extent_${channel}`;
  const offset = `${sign}${delta}.${channel} / ` + (hasScales ? `${sizeSg}` : `span(${extent})`);
  const panFn = !hasScales ? 'panLinear' :
    scaleType === 'log' ? 'panLog' :
    scaleType === 'pow' ? 'panPow' : 'panLinear';
  const update = `${panFn}(${extent}, ${offset})`;

  signal.on.push({
    events: {signal: delta},
    update: hasScales ? update : `clampRange(${update}, 0, ${sizeSg})`
  });
}
