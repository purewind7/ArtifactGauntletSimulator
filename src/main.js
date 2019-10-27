//TODO I should use TS and Angular...

function getNumberInNormalDistribution(mean,std_dev){
    return mean+(randomNormalDistribution()*std_dev);
}
function randomNormalDistribution(){
    var u=0.0, v=0.0, w=0.0, c=0.0;
    do{
        //获得两个（-1,1）的独立随机变量
        u=Math.random()*2-1.0;
        v=Math.random()*2-1.0;
        w=u*u+v*v;
    }while(w==0.0||w>=1.0)
    //这里就是 Box-Muller转换
    c=Math.sqrt((-2*Math.log(w))/w);
    //返回2个标准正态分布的随机数，封装进一个数组返回
    //当然，因为这个函数运行较快，也可以扔掉一个
    //return [u*c,v*c];
    return u*c;
}
function goBarChart(dataArr,canvas){
    // 声明所需变量
    let ctx;
    // 图表属性
    let cWidth, cHeight, cMargin, cSpace;
    let originX, originY;
    // 柱状图属性
    let bMargin, tobalBars, bWidth, maxValue;
    let totalYNomber;
    let gradient;

    // 运动相关变量
    let ctr, numctr, speed;
    //鼠标移动
    let mousePosition = {};

    // 获得canvas上下文
    canvas = document.getElementById("barChart");
    if(canvas && canvas.getContext){
        ctx = canvas.getContext("2d");
    }
    initChart(); // 图表初始化
    drawLineLabelMarkers(); // 绘制图表轴、标签和标记
    drawBarAnimate(); // 绘制柱状图的动画
    //检测鼠标移动
    let mouseTimer = null;
    canvas.addEventListener("mousemove",function(e){
        e = e || window.event;
        if( e.offsetX || e.offsetX===0 ){
            mousePosition.x = e.offsetX;
            mousePosition.y = e.offsetY;
        }else if( e.layerX || e.layerX===0 ){
            mousePosition.x = e.layerX;
            mousePosition.y = e.layerY;
        }

        clearTimeout(mouseTimer);
        mouseTimer = setTimeout(function(){
            ctx.clearRect(0,0,canvas.width, canvas.height);
            drawLineLabelMarkers();
            drawBarAnimate(true);
        },10);
    });

    //点击刷新图表
    canvas.onclick = function(){
        initChart(); // 图表初始化
        drawLineLabelMarkers(); // 绘制图表轴、标签和标记
        drawBarAnimate(); // 绘制折线图的动画
    };


    // 图表初始化
    function initChart(){
        // 图表信息
        cMargin = 60;
        cSpace = 80;
        /*这里是对高清屏幕的处理，
             方法：先将canvas的width 和height设置成本来的两倍
             然后将style.height 和 style.width设置成本来的宽高
             这样相当于把两倍的东西缩放到原来的 1/2，这样在高清屏幕上 一个像素的位置就可以有两个像素的值
             这样需要注意的是所有的宽高间距，文字大小等都得设置成原来的两倍才可以。
        */
        canvas.width = canvas.parentNode.getAttribute("width")* 2 ;
        canvas.height = canvas.parentNode.getAttribute("height")* 2;
        canvas.style.height = canvas.height/2 + "px";
        canvas.style.width = canvas.width/2 + "px";
        cHeight = canvas.height - cMargin - cSpace;
        cWidth = canvas.width - cMargin - cSpace;
        originX = cMargin + cSpace;
        originY = cMargin + cHeight;

        // 柱状图信息
        bMargin = canvas.width/40;
        tobalBars = dataArr.length;
        bWidth = parseInt( cWidth/tobalBars - bMargin );
        maxValue = 0;
        for(let i=0; i<dataArr.length; i++){
            let barVal = parseInt( dataArr[i][1] );
            if( barVal > maxValue ){
                maxValue = barVal;
            }
        }
        maxValue += 5;
        totalYNomber = 10;
        // 运动相关
        ctr = 1;
        numctr = 100;
        speed = 10;

        //柱状图渐变色
        gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'green');
        gradient.addColorStop(1, 'rgba(67,203,36,1)');

    }

    // 绘制图表轴、标签和标记
    function drawLineLabelMarkers(){
        //ctx.translate(0.5,0.5);  // 当只绘制1像素的线的时候，坐标点需要偏移，这样才能画出1像素实线
        ctx.font = "24px Arial";
        ctx.lineWidth = 2;
        ctx.fillStyle = "#000";
        ctx.strokeStyle = "#000";
        // y轴
        drawLine(originX, originY, originX, cMargin);
        // x轴
        drawLine(originX, originY, originX+cWidth, originY);

        // 绘制标记
        drawMarkers();
        //ctx.translate(-0.5,-0.5);  // 还原位置
    }

    // 画线的方法
    function drawLine(x, y, X, Y){
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(X, Y);
        ctx.stroke();
        ctx.closePath();
    }

    // 绘制标记
    function drawMarkers(){
        ctx.strokeStyle = "#E0E0E0";
        // 绘制 y
        let oneVal = parseInt(maxValue/totalYNomber);
        ctx.textAlign = "right";
        for(let i=0; i<=totalYNomber; i++){
            let markerVal =  i*oneVal;
            let xMarker = originX-10;
            let yMarker = parseInt( cHeight*(1-markerVal/maxValue) ) + cMargin;

            ctx.fillText(markerVal, xMarker, yMarker+3, cSpace); // 文字
            if(i>0){
                drawLine(originX+2, yMarker, originX+cWidth, yMarker);
            }
        }
        // 绘制 x
        ctx.textAlign = "center";
        for(let i=0; i<tobalBars; i++){
            let markerVal = dataArr[i][0];
            let xMarker = parseInt( originX+cWidth*(i/tobalBars)+bMargin+bWidth/2 );
            let yMarker = originY+30;
            ctx.fillText(markerVal, xMarker, yMarker, cSpace); // 文字
        }
        // 绘制标题 y
        ctx.save();
        ctx.rotate(-Math.PI/2);
        ctx.fillText("Dollar per Pack", -canvas.height/2, cSpace-10);
        ctx.restore();
        // 绘制标题 x
        ctx.fillText("Win Rate", originX+cWidth/2, originY+cSpace/2+30);
    };

    //绘制柱形图
    function drawBarAnimate(mouseMove){
        for(let i=0; i<tobalBars; i++){
            let oneVal = parseInt(maxValue/totalYNomber);
            let barVal = dataArr[i][1];
            let barH = parseInt( cHeight*barVal/maxValue * ctr/numctr );
            let y = originY - barH;
            let x = originX + (bWidth+bMargin)*i + bMargin;
            drawRect( x, y, bWidth, barH-1, mouseMove );  //高度减一避免盖住x轴
            ctx.fillText((barVal*ctr/numctr).toPrecision(2), x+30, y-8); // 文字
        }
        if(ctr<numctr){
            ctr++;
            setTimeout(function(){
                ctx.clearRect(0,0,canvas.width, canvas.height);
                drawLineLabelMarkers();
                drawBarAnimate();
            }, speed);
        }
    }

    //绘制方块
    function drawRect( x, y, X, Y, mouseMove ){

        ctx.beginPath();
        ctx.rect( x, y, X, Y );

        if(mouseMove && ctx.isPointInPath(mousePosition.x*2, mousePosition.y*2)){ //如果是鼠标移动的到柱状图上，重新绘制图表
            ctx.fillStyle = "green";

        }else{
            ctx.fillStyle = gradient;
            ctx.strokeStyle = gradient;
        }
        ctx.fill();
        ctx.closePath();

    }


}
function arrSum(arr) {
    var s = 0;
    for (var i=arr.length-1; i>=0; i--) {
        s += arr[i];
    }
    return s;
}

function Player() {
    this.id = 0;
    this.playerCapacity = 0.5;
    this.pack = 0;
    this.stat = [0,0,0,0,0,0,0,0,0]; // 0win 1win 2win 3win 4winGTFO 5win1lose 5win0lose total Gauntlet played total Match played
    this.ticket = 1;
    this.money = 0;
    this.win = 0;
    this.lose = 0;
}
Player.prototype.checkWinLose = function() {
    this.stat[8]++;
    if(this.win === 5) {
        this.pack += 2;
        if(this.lose === 1) {
            this.stat[5]++;
            this.stat[7]++;
        }
        if(this.lose === 0) {
            this.stat[6]++;
            this.stat[7]++;
        }
        this.win = 0;
        this.lose = 0;//reinitialize win & lose
    }
    else if(this.lose === 2) {
        if(this.win === 4){
            this.pack += 1;
            this.stat[4]++;
            this.stat[7]++;
            this.win = 0;
            this.lose = 0;
        }
        else if(this.win === 3){
            this.stat[3]++;
            this.stat[7]++;
            this.win = 0;
            this.lose = 0;
        }
        else if(this.win === 2){
            this.stat[2]++;
            this.stat[7]++;
            this.win = 0;
            this.lose = 0;
            this.ticket++;//one ticket for next game
        }
        else if(this.win === 1){
            this.stat[1]++;
            this.stat[7]++;
            this.win = 0;
            this.lose = 0;
            this.ticket++;//one ticket for next game
        }
        else if(this.win === 0){
            this.stat[0]++;
            this.stat[7]++;
            this.win = 0;
            this.lose = 0;
            this.ticket++;//one ticket for next game
        }
    }
};
function playerMatch(player1, player2) { //α win rate: A; β win rate: B; one match, A vs B, win rate of α = A*(1-B)/(A+B-2AB)
    if (Math.random() < player1.playerCapacity*(1-player2.playerCapacity)/(player1.playerCapacity+player2.playerCapacity-2*player1.playerCapacity*player2.playerCapacity)) {
        player1.win++;
        player2.lose++
    }
    else {
        player1.lose++;
        player2.win++
    }
}
function updateTrackPlayer(player) {
    document.getElementById("zeroWin").innerHTML = player.stat[0];
    document.getElementById("oneWin").innerHTML = player.stat[1];
    document.getElementById("twoWin").innerHTML = player.stat[2];
    document.getElementById("threeWin").innerHTML = player.stat[3];
    document.getElementById("fourWin").innerHTML = player.stat[4];
    document.getElementById("fiveOne").innerHTML = player.stat[5];
    document.getElementById("fiveZero").innerHTML = player.stat[6];
    document.getElementById("matchPlayed").innerHTML = player.stat[8];
    document.getElementById("gParticipated").innerHTML = player.stat[7];
    document.getElementById("moneySpent").innerHTML = player.ticket;
    document.getElementById("packGot").innerHTML = player.pack;
    document.getElementById("playerCap").innerHTML = player.playerCapacity;
    document.getElementById("trackPPriceEachPack").innerHTML = (player.ticket/player.pack).toPrecision(3);
}
function mainLoop() {
    console.log("round " + (gauntletRound + 1));
    stillIn = false; // set the tracked player check to false
    // loop of one match
    while (players.length >= 2) {
        matchRound++;
        playerMatch(players[0], players[1]);
        players[0].checkWinLose();
        if (players[0].ticket <= players[0].money) {
            if (Math.random() > 0.5) {
                playersTem.push(players[0]);
            } else {
                playersTem.unshift(players[0]);
            }
            players.shift();
        } else {
            players[0].ticket-1; // the last ticket players[0] bought is 1 over his money
            playersEnd.push(players[0]);
            players.shift();
        }
        players[0].checkWinLose();
        if (players[0].ticket <= players[0].money) {
            if (Math.random() > 0.5) {
                playersTem.push(players[0]);
            } else {
                playersTem.unshift(players[0]);
            }
            players.shift();
        } else {
            players[0].ticket-1;
            playersEnd.push(players[0]);
            players.shift();
        }
    }
    players = players.concat(playersTem);
    playersTem = [];
    // Tracking one player
    for (let i=0; i<players.length; i++) {
        if (players[i].id === 0) {
            updateTrackPlayer(players[i]);
            stillIn = true;
        }
    }
    gauntletRound++;
    if (players.length >= 2) {
        if (stillIn === true) {
            setTimeout(mainLoop, delay);
            //mainLoop();
        } else {
            mainLoop();
        }
    }
    // End and statistics
    else {
        console.log("end");
        playersEnd = playersEnd.concat(players);
        console.log(players);
        console.log(playersTem);
        console.log(playersEnd);
        //all the money spent
        for (let i=0; i<playerNum; i++) {
            totalMoney += playersEnd[i].money;
        }
        totalMoney -= (players[0].money - players[0].ticket); // the last player who has left money
        //all the pack we got
        for (let i=0; i<playerNum; i++) {
            totalPack += playersEnd[i].pack;
        }

        document.getElementById("totalGauntletRound").innerHTML = gauntletRound;
        document.getElementById("totalMatchRound").innerHTML = matchRound;
        document.getElementById("totalMoney").innerHTML = totalMoney;
        document.getElementById("totalPack").innerHTML = totalPack;
        document.getElementById("priceEachPack").innerHTML = (totalMoney / totalPack).toPrecision(3);


        playersEnd.sort((player1,player2) => player1.playerCapacity-player2.playerCapacity);
        console.log(playersEnd);
        let chartArr = [];
        let temArr = [];
        let capArr = [];
        let sectionNum = 25;
        for (let x = 0; x < sectionNum; x++) {
            chartArr[x] = [];
            for (let y = 0; y < 2; y++) {
                chartArr[x][y] = "";
            }
        }
        for (let i=0;i<sectionNum;i++) {
            temArr[i] = [];
        }
        for (let i=0; i<playersEnd.length;i++) {
            if(playersEnd[i].pack === 0) {
                playersEnd[i].pack++;
            }
            for (let j=0;j<sectionNum;j++) {
                if (playersEnd[i].playerCapacity <= 1/sectionNum*(j+1) && playersEnd[i].playerCapacity > 1/sectionNum*j) {
                    temArr[j].push(playersEnd[i].money/playersEnd[i].pack)
                }
            }
        }
        console.log(temArr);
        for (let i=0;i<sectionNum;i++) {
            if (temArr[i].length < 1) {
                capArr[i] = 0;
                temArr[i] = 0;
            } else {
                capArr[i] = temArr[i].length;
                temArr[i] = arrSum(temArr[i])/temArr[i].length;
            }
        }
        for (let i=0;i<sectionNum;i++) {
            chartArr[i][0] = (1/sectionNum*(i+1)).toPrecision(2);
            chartArr[i][1] = temArr[i];
        }
        console.log(capArr);
        console.log(temArr);
        console.log(chartArr);
        Trim: {
        chartArr.shift();
        chartArr.shift();
        chartArr.shift();
        chartArr.shift();
        chartArr.shift();
        chartArr.shift();
        chartArr.shift();}
        goBarChart(
            chartArr, document.getElementById("barChart")
        );
    }

}


let maxMoney = 100;
let playerNum = 100;
let players = [];
let playersTem = [];
let playersEnd = [];
let totalMoney = 0;
let totalPack = 0;
let gauntletRound = 0; // Gauntlet counter
let matchRound = 0; // Match counter
let stillIn = true; // Tracked player still in play
let delay = 1;
let sigma;

window.onload = function() {
    const btn = document.getElementById("startButton");
    btn.onclick = function() {
        playerNum = document.getElementById("playerNumber").value;
        maxMoney = document.getElementById("averageMoney").value * 2;
        sigma = document.getElementById("sigmaOfCap").value;
        // Initialization
        console.log("Initialization");
        players = [];
        playersEnd = [];
        playersTem = [];
        totalPack = 0;
        totalMoney = 0;
        gauntletRound = 0;
        matchRound = 0;
        stillIn = true;
        document.getElementById("totalGauntletRound").innerHTML = "";
        document.getElementById("totalMatchRound").innerHTML = "";
        document.getElementById("totalMoney").innerHTML = "";
        document.getElementById("totalPack").innerHTML = "";
        document.getElementById("priceEachPack").innerHTML = "";
        document.getElementById("playerNum").innerHTML = playerNum;
        for (let i=0; i<playerNum; i++) {
            players.push(new Player());
            players[i].id = i;
            players[i].money = Math.floor(Math.random() * Math.floor(maxMoney))+1;
            //players[i].ticket = players[i].money;
            //players[i].money = 0;
            players[i].playerCapacity = Number(getNumberInNormalDistribution(0.5, sigma).toPrecision(2));
            if (players[i].playerCapacity > 1) {
                players[i].playerCapacity -= 1;
            }
            else if (players[i].playerCapacity < 0) {
                players[i].playerCapacity += 1;
            }
        }
        players[0].playerCapacity = Number(document.getElementById("trackPCapacity").value);
        players[0].money = Number(document.getElementById("trackPMoney").value);
        //players[0].ticket = players[0].money;
        // Main loop
        console.log("start");
        mainLoop();
    }
};