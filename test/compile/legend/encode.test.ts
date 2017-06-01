/* tslint:disable:quotemark */

import {assert} from 'chai';
import {COLOR, SHAPE} from '../../../src/channel';
import * as encode from '../../../src/compile/legend/encode';
import {TimeUnit} from '../../../src/timeunit';
import {NOMINAL, ORDINAL, TEMPORAL} from '../../../src/type';
import {parseUnitModel} from '../../util';

describe('compile/legend', () => {
  describe('encode.symbols', () => {
    it('should not have strokeDash and strokeDashOffset', () => {
      const symbol = encode.symbols({field: 'a'}, {}, parseUnitModel({
          mark: "point",
          encoding: {
            x: {field: "a", type: "nominal"},
            color: {field: "a", type: "nominal"}
          }
        }), COLOR);
        assert.isUndefined((symbol||{}).strokeDash);
        assert.isUndefined((symbol||{}).strokeDashOffset);
    });

    it('should return not override size of the symbol for shape channel', () => {
      const symbol = encode.symbols({field: 'a'}, {}, parseUnitModel({
          mark: "point",
          encoding: {
            x: {field: "a", type: "nominal"},
            shape: {field: "b", type: "nominal", legend: {"shape": "circle"}}}
        }), SHAPE);
        assert.isUndefined(symbol.size);
    });

    it('should return specific symbols.shape.value if user has specified', () => {
      const symbol = encode.symbols({field: 'a'}, {}, parseUnitModel({
          mark: "point",
          encoding: {
            x: {field: "a", type: "nominal"},
            shape: {value: "square"}}
        }), COLOR);
        assert.deepEqual(symbol.shape.value, 'square');
    });
  });

  describe('encode.labels', () => {
    it('should return correct expression for the timeUnit: TimeUnit.MONTH', () => {
      const model = parseUnitModel({
        mark: "point",
        encoding: {
          x: {field: "a", type: "temporal"},
          color: {field: "a", type: "temporal", timeUnit: "month"}}
      });
      const fieldDef = {field: 'a', type: TEMPORAL, timeUnit: TimeUnit.MONTH};
      const label = encode.labels(fieldDef, {}, model, COLOR);
      const expected = `timeFormat(datum.value, '%b')`;
      assert.deepEqual(label.text.signal, expected);
    });

    it('should return correct expression for the timeUnit: TimeUnit.QUARTER', () => {
      const model = parseUnitModel({
        mark: "point",
        encoding: {
          x: {field: "a", type: "temporal"},
          color: {field: "a", type: "temporal", timeUnit: "quarter"}}
      });
      const fieldDef = {field: 'a', type: TEMPORAL, timeUnit: TimeUnit.QUARTER};
      const label = encode.labels(fieldDef, {}, model, COLOR);
      const expected = `'Q' + quarter(datum.value)`;
      assert.deepEqual(label.text.signal, expected);
    });

     it('should return correct expression when you want to format the legend as integers', () => {
      const model = parseUnitModel({
        mark: "point",
        encoding: {
          x: {field: "a", type: "temporal"},
          color: {field: "a", type: "O", formatType: "number", legend: {format: "d"}}
        }
      });
      const fieldDef = {field: 'a', type: ORDINAL, formatType: "number", legend: {format: "d"}};
      const label = encode.labels(fieldDef, {}, model, COLOR);
      assert.deepEqual(label, {text: {signal: 'format(a, \'d\')'}});
    });

    it('should return correct expression when you want to format the legend in a time format', () => {
      const model = parseUnitModel({
        mark: "point",
        encoding: {
          x: {field: "a", type: "temporal"},
          color: {field: "a", type: "N", timeUnit: "quarter", formatType: "time", legend: {format: "%y"}}}
      });
      const fieldDef = {field: 'a', type: NOMINAL, formatType: "time", legend: {format: "%y"}};
      const label = encode.labels(fieldDef, {}, model, COLOR);
      assert.deepEqual(label, {text: {signal: 'timeFormat(datum.value, \'%y\')'}});
    });
  });
});
