g_min_money = 30;
g_delivery_fee = 5;

document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
WeixinJSBridge.call('hideToolbar');
});

$().ready(function(){
    var ck = $.cookie('orderFoods');
    console.log("ck-->%o", ck);
    if(ck == undefined){
        return;
    }
    oFoods = JSON.parse(ck);
    if(oFoods != undefined) {
        var allmoney = 0;
        var arr_keys = ['加辣','加醋','加青菜','加豆芽','加豆皮','加肉类','加米线'];
        for(var key in oFoods){
            var of = oFoods[key];
            console.log(of);
            var xkey = key;
            var allplus = "";
            if(of.allplus){
                for (var i = 0; i < arr_keys.length; i++) {
                    if(arr_keys[i] in of.allplus){
                        allplus += '<b style=\"color:#333333\">o</b>' + of.allplus[arr_keys[i]].name + "&nbsp;";
                    }
                }
            }

            if(key.indexOf('-') > 0) {
                xkey = key.substring(0, key.indexOf('-'));
            }
            var ss = "<div id=\"row-"+key+"\" class=\"row\"><div class=\"foodname ";
            if(allplus != ""){
                ss += "noodles\">" + of.name; 
                ss += "<br><span class=\"pluss\">"+allplus+"</span>"
            }else{
                ss += "\">" + of.name;
            }
            ss += "</div><div class=\"foodprice\">"
                + of.price + "</div>"
                + "<div class=\"increment\" id=\"" + key + "-increment\" onclick=\"javascript:increment('"+key+"',"+of.price+")\">+</div>"
                + "<div id=\""+key+"\" class=\"count\">"+of.count+"</div>"
                + "<div class=\"reduce\" id=\""+key+"-reduce\" onclick=\"javascript:reduce('"+key+"',"+of.price+")\">—</div>"
                + "</div><div class=\"clear\"></div><hr id=\"hr-"+key+"\" >";
            $("#foodlist").append(ss);
            allmoney += of.price * of.count;
        }
        var prize = @yield('prize');
        var totalmoney = allmoney - prize;
        if(allmoney < g_min_money) {
            totalmoney += g_delivery_fee;
            $("#deliveryfee").text(g_delivery_fee+"元");
        }
        $("#allprice").text(allmoney+"元");
        $("#prize").text(prize + "元");
        $("#allpriceH").val(totalmoney);

        $("#submitbtn").val("应付总额：" + totalmoney + "元   提交订单");
    }
});


function increment(id, price) {
    var i = parseInt($("#"+id).text());
    var x;
    if(isNaN(i)) {
        x = 1;
    }else {
        x = i + 1;
    }
    $("#"+id).text(x);
    $("#"+id).addClass("count");
    $("#"+id).removeClass("gray");
    var p = parseInt($("#allprice").text());
    var allmoney = p + price;
    var dfee = g_delivery_fee;
    if(allmoney >= g_min_money) {
        dfee = 0;
        $("#deliveryfee").text(dfee+"元");
    }
    $("#allprice").text(allmoney+"元");
    var prize = @yield('prize');
    var totalmoney = allmoney - prize + dfee;
    $("#allpriceH").val(totalmoney);
    $("#submitbtn").val("应付总额：" + totalmoney + "元   提交订单");
    var ck = $.cookie('orderFoods');
    if(ck == undefined){
        return;
    }
    oFoods = JSON.parse(ck);
    if (id in oFoods) {
        oFoods[id].count += 1; 
    }
    $.cookie('orderFoods', JSON.stringify(oFoods),{path: '/'});
}
function reduce(id, price) {
    var i = parseInt($("#"+id).text());
    if(i == 0 || isNaN(i)) {
        return;
    }
    var x;
    if(i == 1) {
        x = "";
        $("#"+id).addClass("gray");
        $("#row-"+id).hide();
        $("#hr-"+id).hide();
    }else {
        x = i - 1;
    }
    $("#"+id).text(x);
    var p = parseInt($("#allprice").text());
    var allmoney = p - price;
    var dfee = 0;
    if(allmoney < g_min_money) {
        dfee = g_delivery_fee;
        $("#deliveryfee").text(dfee+"元");
    }
    $("#allprice").text(allmoney+"元");
    var prize = @yield('prize');
    var totalmoney = allmoney - prize + dfee;
    if(totalmoney < 0){
        totalmoney = 0;
    }
    $("#allpriceH").val(totalmoney);
    $("#submitbtn").val("应付总额：" + totalmoney + "元   提交订单");
    var ck = $.cookie('orderFoods');
    if(ck == undefined){
        return;
    }
    oFoods = JSON.parse(ck);
    if (id in oFoods) {
        oFoods[id].count -= 1; 
        if(oFoods[id].count == 0){
            oFoods[id] = undefined;
        }
    }
    $.cookie('orderFoods', JSON.stringify(oFoods), {path: '/'});
}

function clearCar(){
    var c = confirm("您确定要清空购物车吗？");
    if(!c) return false;
    $.cookie('orderFoods', '', {path: '/',expires: -1} );
    $.cookie('orderFoods', '', {path: '/order',expires: -1});
    $("#main").hide();
    $("#clearall").show();
}
function chooseDate(){
    var ddate = $("#ddate");
    var dtime = $("#dtime");
    var d = new Date();
    var year = d.getFullYear();
    var month = d.getMonth() + 1; // 记得当前月是要+1的
    var dt = d.getDate();
    var month = d.getMonth() + 1;
    month = month < 10 ? ("0" + month) : month;
    var dt = d.getDate();
    dt = dt < 10 ? ("0" + dt) : dt;
    var today = year + "-" + month + "-" + dt;
    var tomorrow = year + "-" + month + "-" + (dt + 1);
    var after = year + "-" + month + "-" + (dt + 2);
    var hours = d.getHours() + 1;
    if(hours < 10) hours = 10;
    var minutes = d.getMinutes();
    //console.log(today);
    $("#ddate").empty();
    if(hours < 21){
        jQuery("<option></option>").val(today).text(today+"(今天)").appendTo("#ddate")
    }
    jQuery("<option></option>").val(tomorrow).text(tomorrow+"(明天)").appendTo("#ddate")
    jQuery("<option></option>").val(after).text(after+"(后天)").appendTo("#ddate")
    minutes = 15 * (minutes % 15 + 1);
    minutes = minutes == 60 ? 0 : minutes;
    d.setMinutes(minutes);
    d.setHours(hours);
    var now = d.getTime();
    var i = 0;
    for(;;){
        d.setTime(now + 15 * 60 * 1000 * i++);
        if(d.getHours() == 21) {
            break;
        }
        var dtime = d.getHours() + ":" + (d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes());
        jQuery("<option></option>").val(dtime).text(dtime).appendTo("#dtime")
    }
    $("#choosedate").show();   
}

function initDtime(){
    var d = new Date();
    var year = d.getFullYear();
    var month = d.getMonth() + 1; // 记得当前月是要+1的
    var dt = d.getDate();
    var month = d.getMonth() + 1;
    month = month < 10 ? ("0" + month) : month;
    var dt = d.getDate();
    dt = dt < 10 ? ("0" + dt) : dt;
    var today = year + "-" + month + "-" + dt;    
    inutes = 15 * (minutes % 15 + 1);
    minutes = minutes == 60 ? 0 : minutes;
    d.setMinutes(minutes);
    if($("#ddate").val() !== today){
        d.setHours(10);
        d.setMinutes(0);
    }else{
        d.setHours(d.getHours() + 1);
    }
    var now = d.getTime();
    var i = 0;
    $("#dtime").empty();
    for(;;){
        d.setTime(now + 15 * 60 * 1000 * i++);
        if(d.getHours() == 21) {
            break;
        }
        var dtime = d.getHours() + ":" + (d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes());
        jQuery("<option></option>").val(dtime).text(dtime).appendTo("#dtime")
    }    
}
function fapiaoCheck() {
    if($("#fapiao").attr('checked')){
        $("#fapiaotype").show();
    }else{
        $("#fapiaotype").hide();
    }
}

var g_addrs = {};
function chooseAddr(addrid){
    var htmlobj = $.ajax({url:"/order/chooseaddress",async:false});
    // alert(htmlobj.responseText);
    g_addrs = JSON.parse(htmlobj.responseText);
    $("#addrs").empty();
    for(var i in g_addrs){
        var addr = g_addrs[i];
        //alert("1:" + addr.id);
        var ss = "<div class='addrbox' id='addr-"+addr.id+"' onclick='selectOneAddr("+addr.id+")'>"
            +   "<div class='addrcontent'>"
            +       "<div>"+addr.user_name+"&nbsp;&nbsp;"+addr.tel+"</div>"
            +       "<div>"+addr.address+"</div>"
            +       "<input type='hidden' name='addressid' id='addressid' value='"+addr.id+"'/>"
            +   "</div>"
            +   "<div class='newaddr'>"
            +       "<div> > </div>"
            +   "</div>"
            +"</div>"
            +"<div class='editbar' style='display:none;'>"
            +"<div class='del' onclick='javascript:deleteAddr("+addr.id+")'>删除</div>"
            +"<div class='edit' onclick='javascript:addOrEditAddr("+addr.id+")'>编辑</div>"
            +"</div>";
        $("#addrs").append(ss);
    }
    // alert("#addr-"+addrid);
    $("#addr-"+addrid).addClass("selectedaddr");
    $("#main").hide();
    $("#chooseaddr").show();
}

function finishAddr(){
    $("#chooseaddr").hide();
    $("#main").show();
}

function finishEditAddr(){
    $("#addoreditaddr").hide();
    $("#chooseaddr").show();
}
function finishAddAddr(){
    $("#addoreditaddr").hide();
    $("#chooseaddr").hide();
    $("#main").show();
}

function selectOneAddr(aid){
    var addr = g_addrs[aid];
    finishAddr();
    var ss = "<div class='addrcontent' onclick='javascript:chooseAddr("+addr.id+")'>"
        +       "<div>"+addr.user_name+"&nbsp;&nbsp;"+addr.tel+"</div>"
        +       "<div>"+addr.address+"</div>"
        +       "<input type='hidden' name='addressid' id='addressid' value='"+addr.id+"'/>"
        +   "</div>"
        +   "<input type='hidden' name='addressid' id='addressid' value='"+addr.id+"'/>"
        +   "<div class='newaddr'>"
        +       "<div> > </div>"
        +   "</div>";
    $("#theaddr").empty();
    $("#theaddr").append(ss);
}

function editAddrs(){
    if($("#editaddrs").text() == "完成"){
        $("#editaddrs").text("编辑");
        $(".editbar").hide();
    }else{   
        $("#editaddrs").text("完成");
        $(".editbar").show();
    }
}

function deleteAddr(id){
    var htmlobj = $.ajax({url:"/order/deladdress?aid="+id,async:false});
    var result = htmlobj.responseText;
    if(result == 'SUCCESS'){
        chooseAddr();
    }
}

function addOrEditAddr(id,init){
    $("#main").hide();
    $("#chooseaddr").hide();
    $("#addoreditaddr").show();
    if(id != undefined && id in g_addrs){
        //edit
        $("#address").val(g_addrs[id].address);
        $("#username").val(g_addrs[id].user_name);
        $("#tel").val(g_addrs[id].tel);
        $("#addrid").val(g_addrs[id].id);
    }else{
        $("#address").val("");
        $("#username").val("");
        $("#tel").val("");
        $("#addrid").val("");
    }
    if(init){
        $("#goback_addr").attr('onclick', 'javascript:finishAddAddr()');
    }
}

function checkSubmitAddr() {
    // alert(document.getElementById('allprice').innerHTML);
    if($('#address').val() == '')
    {
        alert('请填写地址');
        $('#address').focus();
        return false;
    }
    if($('#username').val() == '')
    {
        alert('请填写名字');
        $('#username').focus();
        return false;
    }
    if($('#tel').val() == '')
    {
        alert('请填写手机号');
        $('#tel').focus();
        return false;
    }
    $('#submitbtnaddr').val('提交中...');
    $('#submitbtnaddr').attr('disabled','disabled');
    var data={
        'address':$("#address").val(),
        'username':$("#username").val(),
        'tel':$("#tel").val(),
        'aid':$("#addrid").val()
    };
    $.post('/order/createaddress', data, function(){
        $("#addoreditaddr").hide();
        chooseAddr();
    });
}

function checkSubmit() {
    // alert(document.getElementById('allprice').innerHTML);
    if(parseInt($('#allprice').text()) == 0) {
        alert('请点餐');
        window.location.href="/menu";
        return false;
    }
    if($("#fapiao").attr("checked") && $("input[name='fapiaotype']:checked").val() == '2'){
        if($("#fpc").val() == ""){
            alert("请填写发票公司名称");
            $("#fpc").focus();
            return false;
        }
    }
    if($("#addressid").val() == undefined){
        alert("请填写配送地址");
        return false;
    }
    $('#submitbtn').val("订单提交中...");
    $('#submitbtn').attr("disabled", "disabled");  
    var ck = $.cookie('orderFoods');
    if(ck == undefined){
        window.location.href="/menu";
        return false;
    }
    oFoods = JSON.parse(ck);
    if(oFoods != undefined) {
        var arr_keys = ['加辣','加醋','加青菜','加豆芽','加豆皮','加肉类','加米线'];
        for(var key in oFoods){
            var of = oFoods[key];
            var allplus = "";
            if(of.allplus){
                for (var i = 0; i < arr_keys.length; i++) {
                    if(arr_keys[i] in of.allplus){
                        allplus += '/' + of.allplus[arr_keys[i]].name + "&nbsp;";
                    }
                }
                if(allplus.indexOf('/') == 0){
                    allplus = allplus.substring(1);
                }
            }
            of['allplusstr'] = allplus;
        }
    }
    $('#orderFoods').val(JSON.stringify(oFoods))
    $.cookie('orderFoods', '', {path: '/',expires: -1} );
    $.cookie('orderFoods', '', {path: '/order',expires: -1});
    document.getElementById('form').submit();
}