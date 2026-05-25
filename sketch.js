// --- 完整 68 題資料庫 ---
const vocabDatabase = [
  { eng: "norm-referenced evaluation", chi: "常模參照" }, { eng: "criterion-referenced evaluation", chi: "標準參照" },
  { eng: "diagnostic evaluation", chi: "診斷性評鑑" }, { eng: "placement evaluation", chi: "安置性評鑑" },
  { eng: "formative evaluation", chi: "形成性評鑑" }, { eng: "summative evaluation", chi: "總結性評鑑" },
  { eng: "reliability", chi: "信度" }, { eng: "validity", chi: "效度" },
  { eng: "Kirkpatrick's evaluation level", chi: "柯氏四層評鑑" }, { eng: "Gardner's theory of multiple intelligences", chi: "多元智能理論" },
  { eng: "cognitive domain", chi: "認知" }, { eng: "affective domain", chi: "情意" },
  { eng: "psychomotor domain", chi: "動作技能" }, { eng: "Gagne's learning hierarchy", chi: "學習階層" },
  { eng: "Gagne's nine events of instruction", chi: "九大教學事件" }, { eng: "inquiry instruction", chi: "探究教學" },
  { eng: "direct instruction", chi: "指導教學" }, { eng: "problem-solving instruction", chi: "問題解決" },
  { eng: "creative thinking", chi: "創造思考" }, { eng: "cooperative learning", chi: "合作學習" },
  { eng: "role-playing instruction", chi: "角色扮演" }, { eng: "group discussion", chi: "討論教學" },
  { eng: "analysis", chi: "分析" }, { eng: "design", chi: "設計" },
  { eng: "development", chi: "發展" }, { eng: "implementation", chi: "實施" },
  { eng: "evaluation", chi: "評鑑" }, { eng: "general motivation to learn", chi: "一般動機" },
  { eng: "specific motivation to learn", chi: "特定動機" }, { eng: "extrinsic motivation", chi: "外部動機" },
  { eng: "intrinsic motivation", chi: "內部動機" }, { eng: "Maslow's need hierarchy", chi: "馬斯洛需求論" },
  { eng: "moro reflex", chi: "驚嚇反射" }, { eng: "classical conditioning", chi: "古典制約" },
  { eng: "operant conditioning", chi: "操作制約" }, { eng: "primary reinforcement/reinforcer", chi: "主要增強物" },
  { eng: "secondary reinforcement/reinforcer", chi: "次要增強物" }, { eng: "direct modeling", chi: "直接模仿" },
  { eng: "synthesized modeling", chi: "綜合模仿" }, { eng: "symbolic modeling", chi: "象徵模仿" },
  { eng: "abstract modeling", chi: "抽象模仿" }, { eng: "Bruner's discovery learning", chi: "發現學習理論" },
  { eng: "enactive stage", chi: "動作表徵" }, { eng: "iconic stage", chi: "圖像表徵" },
  { eng: "symbolic stage", chi: "符號表徵" }, { eng: "Ausubel's meaningful learning", chi: "意義學習理論" },
  { eng: "superordinate concept", chi: "上層大概念" }, { eng: "subordinate concept", chi: "下層小概念" },
  { eng: "assimilation", chi: "同化" }, { eng: "accommodation", chi: "調適" },
  { eng: "behaviorism", chi: "行為學派" }, { eng: "cognitivism", chi: "認知學派" },
  { eng: "constructivism", chi: "建構學派" }, { eng: "Piaget's cognitive development", chi: "認知發展論" },
  { eng: "sensorimotor stage", chi: "感覺動作期" }, { eng: "preoperational stage", chi: "前運思期" },
  { eng: "concrete operational stage", chi: "具體運思期" }, { eng: "formal operational stage", chi: "形式運思期" },
  { eng: "reversibility", chi: "可逆性思考" }, { eng: "irreversibility", chi: "不可逆性思考" },
  { eng: "conservation", chi: "守恆" }, { eng: "scaffolding", chi: "鷹架理論" },
  { eng: "zone of proximal development (ZPD)", chi: "近側發展區" }, { eng: "Erikson's psychosocial development", chi: "心理社會發展理論" },
  { eng: "Kohlberg's moral development", chi: "道德發展理論" }, { eng: "preconventional level", chi: "道德成規前期" },
  { eng: "conventional level", chi: "道德成規期" }, { eng: "postconventional level", chi: "道德自律期" }
];

let state = 'LEARN'; 
let currentLearnWords = [];
let learnIndex = 0;
let quizQuestions = [];
let quizIndex = 0;
let quizStatus = 'QUESTION';
let resultMessage = "";
let resultTimer = 0;
let wrongWordsThisRound = [];

let video, handpose, predictions = [], modelReady = false;
let targetAnswer = 0, holdFrames = 0;
const REQUIRED_FRAMES = 30; 

let btnPrev, btnNext, btnSpeak, btnGoQuiz, btnGoLearn;

// 海底特效變數
let bubbles = [];
let seaweeds = [];
let seaweedTime = 0;
let clownfish;

// 粉彩調色盤
const seaweedColors = ['#eae4e9', '#fff1e6', '#fde2e4', '#fad2e1', '#e2ece9', '#bee1e6', '#f0efeb', '#dfe7fd', '#cddafd'];

function setup() {
  let canvas = createCanvas(800, 600);
  canvas.parent('app-container');
  
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide(); 
  
  handpose = ml5.handpose(video, () => { modelReady = true; });
  handpose.on("predict", results => { predictions = results; });

  setupButtons();
  generateNewCycle();

  for (let i = 0; i < 25; i++) {
    bubbles.push({ 
      x: random(width), 
      y: random(height), 
      r: random(6, 18), 
      speed: random(1, 2.5),
      popping: false,
      popFrames: 0
    });
  }

  for (let x = 0; x <= width; x += 30) {
    seaweeds.push({
      x: x + random(-10, 10),
      color: random(seaweedColors),
      swayOffset: random(TWO_PI),
      height: random(120, 220)
    });
  }

  clownfish = { x: -100, y: 300, targetY: 300, speed: 2 };
}

function draw() {
  drawDeepSeaBackground();
  
  if (state === 'LEARN') {
    drawLearnArea();
  } else if (state === 'QUIZ') {
    drawQuizArea();
  }

  drawSeaweed();
  drawClownfish();
  drawBubbles();
}

function drawDeepSeaBackground() {
  background(0, 78, 146);
  for (let i = 0; i < height; i += 2) {
    let inter = map(i, 0, height, 0, 1);
    let c = lerpColor(color(0, 100, 200, 50), color(0, 5, 20), inter);
    stroke(c);
    line(0, i, width, i);
  }
}

function drawBubbles() {
  for (let b of bubbles) {
    if (b.popping) {
      let alpha = map(b.popFrames, 0, 15, 200, 0);
      stroke(255, 255, 255, alpha);
      strokeWeight(2);
      noFill();
      ellipse(b.x, b.y, b.r + b.popFrames * 2);
      
      b.popFrames++;
      if (b.popFrames > 15) {
        b.y = height + 20;
        b.x = random(width);
        b.popping = false;
        b.popFrames = 0;
      }
    } else {
      stroke(255, 255, 255, 120);
      strokeWeight(1.5);
      fill(255, 255, 255, 30);
      ellipse(b.x, b.y, b.r);
      
      noStroke();
      fill(255, 255, 255, 200);
      ellipse(b.x - b.r * 0.25, b.y - b.r * 0.25, b.r * 0.3);

      b.y -= b.speed;
      b.x += sin(frameCount * 0.03 + b.y * 0.02) * 0.8;

      if (b.y < -10) {
        b.y = height + 20;
        b.x = random(width);
      } else if (b.y < height - 50 && random() < 0.003) {
        b.popping = true;
      }
    }
  }
}

function drawSeaweed() {
  seaweedTime += 0.02;
  
  for (let sw of seaweeds) {
    stroke(sw.color);
    strokeWeight(10);
    noFill();
    
    beginShape();
    for (let y = height; y > height - sw.height; y -= 15) {
      let amplitude = map(y, height, height - sw.height, 0, 25);
      let xOff = sin((y * 0.03) + seaweedTime + sw.swayOffset) * amplitude;
      curveVertex(sw.x + xOff, y);
    }
    endShape();
  }
}

function drawClownfish() {
  push();
  let floatY = sin(frameCount * 0.05) * 5;
  translate(clownfish.x, clownfish.y + floatY);
  
  noStroke();
  fill(255, 120, 0); 
  let tailSway = sin(frameCount * 0.3) * 8;
  triangle(-20, 0, -45, -15 + tailSway, -45, 15 + tailSway);
  fill(255);
  triangle(-30, 0, -42, -8 + tailSway, -42, 8 + tailSway);

  fill(255, 120, 0);
  ellipse(0, 0, 60, 35);
  
  fill(255);
  rect(-12, -17, 12, 34, 5); 
  rect(10, -15, 8, 30, 5);
  
  fill(0);
  ellipse(20, -5, 6, 6);
  fill(255);
  ellipse(21, -6, 2, 2);
  
  fill(255, 120, 0);
  ellipse(2, 5, 15, 8);
  pop();

  clownfish.x += clownfish.speed;
  clownfish.y = lerp(clownfish.y, clownfish.targetY, 0.015);
  if (frameCount % 90 === 0) clownfish.targetY = random(150, 450);
  if (clownfish.x > width + 100) clownfish.x = -100;
}

// ---------------- 介面與功能核心 ----------------
function setupButtons() {
  btnPrev = createButton('⬅ 上一步');
  btnPrev.parent('app-container');
  btnPrev.position(80, 420);
  btnPrev.mousePressed(() => { if(learnIndex > 0) learnIndex--; });

  btnNext = createButton('下一步 ➡');
  btnNext.parent('app-container');
  btnNext.position(615, 420);
  btnNext.mousePressed(() => { 
    if(learnIndex < currentLearnWords.length - 1) { learnIndex++; } 
    else { enterQuizMode(); }
  });

  btnGoQuiz = createButton('🚢 進入測驗區');
  btnGoQuiz.parent('app-container');
  btnGoQuiz.id('btnQuiz');
  btnGoQuiz.position(width/2, 420); 
  btnGoQuiz.addClass('center-x');
  btnGoQuiz.mousePressed(enterQuizMode);

  btnSpeak = createButton('🔊 朗讀聲音');
  btnSpeak.parent('app-container');
  btnSpeak.position(width/2, 340); 
  btnSpeak.addClass('center-x');
  btnSpeak.mousePressed(speakWord);

  btnGoLearn = createButton('🌊 返回學習區');
  btnGoLearn.parent('app-container');
  btnGoLearn.id('btnLearn');
  btnGoLearn.position(20, 20);
  btnGoLearn.mousePressed(enterLearnMode);
  btnGoLearn.hide();
}

function drawLearnArea() {
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(32);
  textStyle(BOLD);
  text("🌊 專業英文單字學習區", width/2, 50);
  
  textSize(16);
  textStyle(NORMAL);
  text(`潛水深度: ${learnIndex + 1} / ${currentLearnWords.length}`, width/2, 90);
  
  fill(255, 255, 255, 50);
  stroke(255, 255, 255, 100);
  strokeWeight(2);
  rectMode(CORNER);
  rect(50, 120, 700, 370, 150);
  
  let currentWord = currentLearnWords[learnIndex];
  
  // 優化後的字體顯示 (利用 Bounding Box 自動換行，不再用迴圈)
  fill(255);
  noStroke();
  textSize(42); 
  textStyle(BOLD);
  textWrap(WORD);
  rectMode(CENTER);
  text(currentWord.eng, width/2, 220, 600, 150); 
  rectMode(CORNER);
  
  fill(178, 235, 255);
  textSize(36);
  textStyle(NORMAL);
  text(currentWord.chi, width/2, 290);
}

function drawQuizArea() {
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  fill(0, 40, 80, 200); 
  rect(0, 0, width, height);
  pop();

  if (!modelReady) {
    fill(255); textSize(32); textAlign(CENTER);
    text("正在召喚深海魚群 (模型載入中)...", width/2, height/2);
    return;
  }

  if (quizIndex >= quizQuestions.length) {
    fill(255); textSize(48); textAlign(CENTER);
    text("🎊 探險成功！", width/2, height/2);
    textSize(20);
    text("所有錯題皆已征服，點擊左上角重啟旅程", width/2, height/2 + 50);
    return;
  }

  let q = quizQuestions[quizIndex];
  
  fill(255); 
  textSize(36); 
  textStyle(BOLD); 
  textAlign(CENTER);
  textWrap(WORD);
  rectMode(CENTER);
  text(q.eng, width/2, 120, 750, 100);
  rectMode(CORNER);
  
  textSize(16); textStyle(NORMAL); fill(200);
  text(`剩餘挑戰: ${quizQuestions.length - quizIndex} 題`, width/2, 175);

  let stoneW = 170, stoneH = 100, gap = 20;
  let startX = (width - (4 * stoneW + 3 * gap)) / 2;
  for (let i = 0; i < 4; i++) {
    let x = startX + i * (stoneW + gap);
    let y = 250;
    
    fill(100, 110, 120);
    stroke(80);
    strokeWeight(2);
    beginShape();
    vertex(x+10, y); vertex(x+stoneW-10, y+5); vertex(x+stoneW, y+stoneH-20);
    vertex(x+stoneW-30, y+stoneH); vertex(x+20, y+stoneH); vertex(x, y+stoneH-30);
    endShape(CLOSE);
    
    noStroke(); fill(255); textSize(18); textStyle(BOLD);
    text(`選項 ${i+1}`, x + stoneW/2, y + 35);
    textSize(16); textStyle(NORMAL);
    text(q.options[i], x + stoneW/2, y + 65);

    if (quizStatus === 'QUESTION' && targetAnswer === i + 1) {
      fill(0, 191, 255, 150);
      let pY = map(holdFrames, 0, REQUIRED_FRAMES, 0, stoneH);
      rect(x+5, y + stoneH - pY, stoneW-10, pY, 5);
    }
  }

  handleQuizLogic();
}

// ---------------- 核心通用函數 ----------------
function speakWord() {
  let word = currentLearnWords[learnIndex].eng;
  let u = new SpeechSynthesisUtterance(word);
  u.lang = 'en-US';
  window.speechSynthesis.speak(u);
}

function handleQuizLogic() {
  if (quizStatus === 'QUESTION') {
    let fingers = countFingers();
    fill(255); textSize(20); textAlign(CENTER);
    text(`🔦 探照燈偵測: ${fingers > 0 ? fingers : '...'}`, width/2, 450);
    
    if (fingers >= 1 && fingers <= 4) {
      if (fingers === targetAnswer) { holdFrames++; } 
      else { targetAnswer = fingers; holdFrames = 1; }
      if (holdFrames >= REQUIRED_FRAMES) checkAnswer(targetAnswer, quizQuestions[quizIndex].correct);
    } else { holdFrames = max(0, holdFrames - 2); }
  } else {
    fill(resultMessage.startsWith("✅") ? "#00ffcc" : "#ff4d4d");
    textSize(50); textAlign(CENTER);
    text(resultMessage, width/2, 480);
    if (millis() - resultTimer > 2000) { quizIndex++; quizStatus = 'QUESTION'; targetAnswer = 0; holdFrames = 0; }
  }
}

function countFingers() {
  if (predictions.length > 0) {
    let l = predictions[0].landmarks;
    let c = 0;
    if (l[8][1] < l[6][1]) c++; if (l[12][1] < l[10][1]) c++;
    if (l[16][1] < l[14][1]) c++; if (l[20][1] < l[18][1]) c++;
    return c;
  }
  return 0;
}

function checkAnswer(s, c) {
  quizStatus = 'RESULT'; resultTimer = millis();
  let q = quizQuestions[quizIndex];
  if (s === c) {
    resultMessage = "✅ 正確！";
  } else {
    resultMessage = `❌ 錯誤！`;
    if (!wrongWordsThisRound.some(w => w.eng === q.eng)) wrongWordsThisRound.push({ eng: q.eng, chi: q.chi });
    let options = shuffleArray([...q.options]);
    quizQuestions.push({ eng: q.eng, chi: q.chi, options: options, correct: options.indexOf(q.chi) + 1 });
  }
}

function enterQuizMode() {
  state = 'QUIZ'; wrongWordsThisRound = []; quizIndex = 0;
  quizQuestions = currentLearnWords.map(w => {
    // 過濾掉當前單字，隨機抽取3個錯誤選項
    let otherOptions = vocabDatabase.filter(d => d.chi !== w.chi).map(d => d.chi);
    let options = shuffleArray([w.chi, ...shuffleArray(otherOptions).slice(0,3)]);
    return { eng: w.eng, chi: w.chi, options, correct: options.indexOf(w.chi) + 1 };
  });
  btnPrev.hide(); btnNext.hide(); btnSpeak.hide(); btnGoQuiz.hide(); btnGoLearn.show();
}

function enterLearnMode() {
  state = 'LEARN'; learnIndex = 0;
  if (wrongWordsThisRound.length > 0) {
    let next = [...wrongWordsThisRound];
    let db = shuffleArray(vocabDatabase);
    for (let d of db) { if (next.length < 10 && !next.some(n => n.eng === d.eng)) next.push(d); }
    currentLearnWords = next;
  } else {
    currentLearnWords = shuffleArray(vocabDatabase).slice(0, 10);
  }
  btnPrev.show(); btnNext.show(); btnSpeak.show(); btnGoQuiz.show(); btnGoLearn.hide();
}

function generateNewCycle() { currentLearnWords = shuffleArray(vocabDatabase).slice(0, 10); }

// 優化後穩定的洗牌演算法 (Fisher-Yates Shuffle)
function shuffleArray(array) {
  let arr = [...array]; 
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}