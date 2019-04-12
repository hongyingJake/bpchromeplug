import Vue from 'vue' ;
import './layer/layer.css';
import data from './js/data';
import watch from './js/watch';
import layer from "./layer/layer";
import layerForm from './js/form';
import FileSaver from 'file-saver'; //Blob 类型数据保存到本地文件
import html2markdown from './js/html2markdown'; //HTML字符串转mark字符串
import onclick from './js/onclick';
import getcsspath from './js/getCsspath';
import selectedDom from './js/selectedDom';
import shelter from './js/selector/shelter';
import bpServer from './js/bpServer'
import eventTypes from './js/enum/eventEnum'
Vue.config.productionTip = false;

let shelterUi = new shelter();

new Vue({
  el: "#__mtBP_configure_container",
  mixins: [data, onclick, getcsspath, watch, selectedDom,bpServer],
  data() {
    return {
      eventTypes: eventTypes,
      finished: false, //是否完成配置，配置完成后展示删除服务器按钮
      selectedEl: null, //当前选中的元素
      selectedElList: [], //选中的元素集合
      lastSelectedElList: [] ,//上一次选中的元素集合，目的把之前选择元素背景色去掉
      saveServerElList: [], //已保存到服务器上的元素集合，通过ajax从服务器获取
      lastSaveServerElList: [] //上一次以保存到服务器上的元素集合
    };
  },
  methods: {
    //上传服务器
    uploaddata() {
      let that = this;
      this.finished = false;
      console.log('上传服务器埋点信息：',this.selectedElList);
      this.saveServerElList=this.saveServerElList.concat(this.selectedElList);
      this.selectedElList= [];
      this.beginSelect();
      this.mtBpUpload({},function () {
        layer.msg("上传服务器成功", {
          zIndex: 2147483620,
          time: 1000,
          icon: 1
        });
      },function () {
        layer.msg("上传服务器失败", {
          zIndex: 2147483630,
          time: 1000,
          icon: 2
        });
      });
      console.log('已上传服务器埋点：',this.saveServerElList);
    },
    //删除埋点
    del(index) {
      let that = this;
      layer.confirm('您确定要删除这个埋点吗？', {
        icon: 3
      }, function(i) {
        that.lastSelectedElList = JSON.parse(JSON.stringify(that.selectedElList));
        that.selectedElList.splice(index, 1);
        layer.close(i);
      });
    },
    delServer(index) {
      let that = this;
      layer.confirm('您确定要删除服务器上埋点吗？', {
        icon: 3
      }, function(i) {
        that.saveServerElList.splice(index, 1);
        layer.close(i);
      });
    },
    //完成抓取，开始上传服务器
    finish() {
      if (this.selectedElList.length == 0) {
        layer.msg("请设置抓取内容", {
          zIndex: 2147483620,
          time: 1000,
          icon: 2
        });
        return false;
      }
      this.finished = true;
      this.endSelect();
    },
    //返回
    back() {
      this.finished = false;
      this.beginSelect();
    },
    beginSelect() {
      let that = this;
      shelterUi.beginSelect(that.onDomClick, null,
        function(selectedEl) {
          that.selectedEl = selectedEl;
        });
    },
    endSelect(clear) {
      let that = this;
      shelterUi.endSelect();
      if (clear) {
        this.lastSelectedElList.forEach(el => {
          that.clearSelectedDom(el);
        });
        this.lastSaveServerElList.forEach(el => {
          that.clearSelectedDom(el);
        });
      }
    }
  },
  //计算属性
  computed: {

  },
  beforeCreate() {
    let that = this;
    layerForm(function() {
      that.endSelect(true);
    });
  },
  mounted() {
    this.beginSelect();
    $(".__mtBP_configure_item h4").bind("click", function() {
      if ($(this).next().is(":visible")) {
        $(this).next().slideUp("fast").end().removeClass("selected");
        $(this).find("b").html("+")
      } else {
        $(this).next().slideDown("fast").end().addClass("selected");
        $(this).find("b").html("-")
      }
    })
  },
});
