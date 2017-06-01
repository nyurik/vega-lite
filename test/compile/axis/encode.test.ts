/* tslint:disable:quotemark */

import {assert} from 'chai';

import * as encode from '../../../src/compile/axis/encode';
import {parseModel, parseUnitModel} from '../../util';


describe('compile/axis', () => {
  describe('encode.labels()', function () {
    it('should rotate label', function() {
      const model = parseUnitModel({
        mark: "point",
        encoding: {
          x: {field: "a", type: "temporal", timeUnit: "month"}
        }
      });
      const labels = encode.labels(model, 'x', {}, {});
      assert.equal(labels.angle.value, 270);
    });

    it('should have correct text.signal for quarter timeUnits', function () {
      const model = parseUnitModel({
        mark: "point",
        encoding: {
          x: {field: "a", type: "temporal", timeUnit: "quarter"}
        }
      });
      const labels = encode.labels(model, 'x', {}, {});
      const expected = "'Q' + quarter(datum.value)";
      assert.equal(labels.text.signal, expected);
    });

    it('should have correct text.signal for yearquartermonth timeUnits', function () {
      const model = parseUnitModel({
        mark: "point",
        encoding: {
          x: {field: "a", type: "temporal", timeUnit: "yearquartermonth"}
        }
      });
      const labels = encode.labels(model, 'x', {}, {});
      const expected = "'Q' + quarter(datum.value) + ' ' + timeFormat(datum.value, '%b %Y')";
      assert.equal(labels.text.signal, expected);
    });

    it('should format temporal formatType properly even if other parameters like angle is changed', () => {
      const model = parseUnitModel({
        mark: "point",
        encoding: {
          x: {field: "a", type: "O", timeUnit: "yearquartermonth", formatType: "time", axis: {format: "%y", labelAngle: 90}}
        }
      });
      const labels = encode.labels(model, 'x', {}, {});
      assert.deepEqual(labels, {
        text: {signal: 'timeFormat(datum.value, \'%y\')'},
        angle: {value: 90},
        align: {value: 'center'},
        baseline: {value: 'bottom'}
      });
    });

    it('should format temporal formatType if axis is formatted as an integers', () => {
      const model = parseUnitModel({
        mark: "point",
        encoding: {
          x: {field: "a", type: "N", formatType: "number", axis: {format: "d"}}
        }
      });
      const labels = encode.labels(model, 'x', {}, {});
      assert.deepEqual(labels, {
        text: {signal: 'format(a, \'d\')'},
        angle: {value: 270},
        align: {value: 'right'},
        baseline: {value: 'middle'}
      });
    });
  });
});
