/**
 * @Created by k186 on 2018/2/28.
 * @Name: pd-table-row-span
 * @GitHub: https://github.com/k186/pd-table-row-span
 * @Email: k1868548@gmail.com
 * @license: MIT
 */
import $ from 'jquery';

$.fn.PdTableRowSpan = function (option) {
  var args = Array.apply(null, arguments);
  args.shift();
  var internal_return;
  this.each(function () {
    var $this = $(this),
      data = $this.data('pdtablerowspan'),
      options = typeof option === 'object' && option;
    if (!data) {
      $this.data('pdtablerowspan', (data = new PdTableRowSpan(this, options)));
    }
    if (typeof option === 'string' && typeof data[option] === 'function') {
      internal_return = data[option].apply(data, args);
      if (internal_return !== undefined) {
        return false;
      }
    }
  });
  if (internal_return !== undefined)
    return internal_return;
  else
    return this;
};


/*
  * @Class PdTableRowSpan
  * @param {Object} context ,table dom 实例 只会对<tbody></tobdy> 内的内容进行合并
  * */
export default class PdTableRowSpan {
  constructor(context, opt) {
    this.$context = $(context);
    this.$options = {};
    _fn.init(this, opt);
  }

  /*
* @Method {Function}
* */
  merge() {
    // var $rowData = $tbody.children().clone();
    var that = this;
    var $table = that.$context;
    var $tbody = $table.find('tbody');
    var $rowData = $tbody.children();
    var mergeMap = {};
    var from = that.$options.from != null ? that.$options.from : 0;
    var to = that.$options.to;
    var rowCount = $rowData.length;
    var colCount = to != null ? to : $rowData.eq(0).find(that.$options.tags).length;
    for (var c = from; c < colCount; c++) {
      for (var r = 0; r < rowCount; r++) {
        var colData = $rowData.eq(r).find(that.$options.tags).eq(c);
        mergeMap[c] = mergeMap[c] ? mergeMap[c] : [];
        mergeMap[c].push({
          row: r,
          col: c,
          data: colData.html(),
          isMerge: false,
          rowSpan: 0,
          mergeId: undefined
        })
      }
    }
    //开始合并
    var mergeIdMap = [];
    for (var k in mergeMap) {
      var rowSpanData = mergeMap[k];

      for (var i = 0; i < rowSpanData.length; i++) {
        var currentData = rowSpanData[i].data;
        var nextData = rowSpanData[i + 1] ? rowSpanData[i + 1].data : null;
        if (currentData == nextData) {
          //判断前一列有没有合并
          var cl = from;
          if (mergeMap[cl][i].mergeId != undefined && mergeMap[cl][i].mergeId != mergeMap[cl][i + 1].mergeId && mergeMap[cl][i + 1].mergeId != undefined) {
            if (mergeMap[k][i].isMerge) {
              $rowData.eq(i).find('td').eq(k).attr('data-row', mergeMap[k][i].mergeId);
              mergeIdMap.push(mergeMap[k][i].mergeId);
              $.unique(mergeIdMap);
            }
            continue
          } else {
            mergeMap[k][i].isMerge = true;
            mergeMap[k][i + 1].isMerge = true;
            if (mergeMap[k][i].mergeId != undefined) {
              mergeMap[k][i].mergeId = mergeMap[k][i].mergeId;
            } else {
              mergeMap[k][i].mergeId = k + '-' + i;
            }
            mergeMap[k][i + 1].mergeId = mergeMap[k][i].mergeId;
            mergeIdMap.push(mergeMap[k][i].mergeId);
            $.unique(mergeIdMap);
          }
        }
        if (mergeMap[k][i].isMerge) {
          $rowData.eq(i).find('td').eq(k).attr('data-row', mergeMap[k][i].mergeId)
        }
      }
    }
    for (var index = 0; index < mergeIdMap.length; index++) {
      var tds = $rowData.find('td[data-row=' + mergeIdMap[index] + ']');
      tds.eq(0).attr('rowspan', tds.length);
      tds.eq(0).css({
        verticalAlign: that.$options.verticalAlign
      });
      tds.each(function (i) {
        if (i != 0) {
          this.remove()
        }
      });
    }
    return this.$context;
  }

  destroy() {
    var that = this;
    that.$context.find('tbody').children().remove();
    var back = that.$tableBackup.find('tbody').children().clone();
    that.$context.find('tbody').append(back);
    that.$context.data('pdtablerowspan', null);
    that.$options = {};
    return this.$context;
  }
}


/*
* @Method private function
* */
let _fn = {
  /*
  * @Method {Function} init ,init options
  * */
  init: function ($context, $options) {
    let that = $context;
    let $table = that.$context;
    let $tbody = $table.find('tbody');
    if ($tbody.children().length < 1) {
      console.warn(PREFIX + '表格无数据');
      return
    }
    //option 初始化
    that.$options = $.extend(true, $.extend(true, {}, OPTIONS), $options);
    //option 矫正
    let backTable = $($table).clone();
    _fn.regOptions($context, backTable);
    //备份原始表格
    if (!that.$tableBackup) {
      that.$tableBackup = backTable;
    }
    //table merge
    that.merge();
  },
  regOptions: function ($context, $table) {
    //from 不能超过列数 最小1
    //to 不能大于列数且要大于from
    //verticalAlign ['top','middle','bottom']
    let that = $context;
    let from = that.$options.from;
    let to = that.$options.to;
    let verticalAlign = that.$options.verticalAlign;
    let verticalAlignArr = ['top', 'middle', 'bottom'];
    let colCount = $table.find('tbody').children().eq(0).find(that.$options.tags).length;
    if (from) {
      if (from >= 1 && from <= colCount + 1) {
        that.$options.from -= 1;
      } else {
        that.$options.from = null;
      }
    }
    if (to) {
      if (to <= colCount && to >= from) {
      } else {
        that.$options.to = null;
      }
    }
    if (verticalAlignArr.indexOf(verticalAlign) > -1) {
    } else {
      that.$options.verticalAlign = 'middle'
    }

  }

};
let OPTIONS = {
  tags: 'td',//包裹数据的类 防止 td 下有div 等标签包裹
  verticalAlign: 'middle',
  from: null,
  to: null
};
let PREFIX = 'PdTableRowSpan ERROR: ';

