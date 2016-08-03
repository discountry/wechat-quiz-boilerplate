(function () {
    'use strict';

    //Game Logic

    /**
     * 定义游戏全局变量
     * 题目号 id
     * 得分 score
     * 题目数据 questions
     * 成就数据 achievements
     */
    var id = 0;
    var score = 0;

    var questions = [];
    var achievements = [];

    /**
     * 服务器ajax交互
     */

    //确保程序同步运行
    $.ajaxSettings.async = false;
    //获取问题信息
    function getQuestionsFromServer() {
        $.getJSON("questions.json",function (data) {
            questions = data.questions;
        });

    };
    //获取成就信息
    function getAchievementsFromServer() {
        $.getJSON("achievements.json",function (data) {
            achievements = data.achievements;
        });

    };
    //获取所有信息
    function getInfoFromServer() {
        getQuestionsFromServer();
        getAchievementsFromServer();
    };

    /**
     * 游戏状态设置操作
     */

    //更新题目信息
    function setQuestion() {
        $('#question').hide();

        $('.question').text(questions[id].question);
        $('.pic').attr('src',questions[id].pic);
        $('.first').text(questions[id].options[0]);
        $('.second').text(questions[id].options[1]);
        $('.third').text(questions[id].options[2]);
        $('.fourth').text(questions[id].options[3]);

        $('#question').fadeIn();
    };
    //开始游戏
    function startGame() {
        $('.swiper-wrapper').loadTemplate($('#play'),
        {
            question : questions[0].question,
            pic : questions[0].pic,
            optionA : questions[0].options[0],
            optionB : questions[0].options[1],
            optionC : questions[0].options[2],
            optionD : questions[0].options[3]
        });

        lockSliders();

        $('.option').click(function () {
                checkAnswer(this);
            });
    };
    //游戏结束
    function gameOver() {
        $('.swiper-wrapper').loadTemplate($('#result'),
        {
            score : score,
            title : achievements[score].title,
            description : achievements[score].description
        });

        lockSliders();
        setAnimation();

    };
    //通关成功
    function stageClear() {
        $('.swiper-wrapper').loadTemplate($('#success'),
        {
            score : score,
            title : achievements[score].title,
            description : achievements[score].description
        });
        lockSliders();
        setAnimation();
    };
    //添加结果页面动画
    function setAnimation() {

        $('.score').addClass('animated tada');
        $('.title').addClass('animated bounceIn');
        $('.description').addClass('animated bounceIn');
        $('.retry').addClass('animated pulse');
    };
    //锁定滑动
    function lockSliders() {
        $('.swiper-container')[0].swiper.slideTo(0);
        $('.swiper-container')[0].swiper.lockSwipes();
        $('.up-arrow').hide();
    };
    //检查答案
    function checkAnswer(option) {
        if ($(option).text() == questions[id].answer) {
            score += 1;
        }
        if (score == questions.length){
            stageClear();
            return;
        }
        id += 1;
        if (id == questions.length) {
            gameOver();
            return;
        }
        setQuestion();
    };



    // load dependencies
    var animationControl = require('./animation-control.js');


    $(document).ready(function () {
        var bgMusic = $('audio').get(0);
        var $btnMusic = $('.btn-music');
        var $upArrow = $('.up-arrow');

        // background music control
        $btnMusic.click(function () {
            if (bgMusic.paused) {
                bgMusic.play();
                $(this).removeClass('paused');
            } else {
                bgMusic.pause();
                $(this).addClass('paused');
            }
        });

        // init Swiper
        new Swiper('.swiper-container', {
            mousewheelControl: true,
            effect: 'coverflow',    // slide, fade, coverflow or flip
            speed: 400,
            direction: 'vertical',
            fade: {
                crossFade: false
            },
            coverflow: {
                rotate: 100,
                stretch: 0,
                depth: 300,
                modifier: 1,
                slideShadows: false     // do disable shadows for better performance
            },
            flip: {
                limitRotation: true,
                slideShadows: false     // do disable shadows for better performance
            },
            onInit: function (swiper) {
                animationControl.initAnimationItems();  // get items ready for animations
                animationControl.playAnimation(swiper); // play animations of the first slide
            },
            onTransitionStart: function (swiper) {     // on the last slide, hide .btn-swipe
                if (swiper.activeIndex === swiper.slides.length - 1) {
                    $upArrow.hide();
                } else {
                    $upArrow.show();
                }
            },
            onTransitionEnd: function (swiper) {       // play animations of the current slide
                animationControl.playAnimation(swiper);
            },
            onTouchStart: function (swiper, event) {    // mobile devices don't allow audios to play automatically, it has to be triggered by a user event(click / touch).
                if (!$btnMusic.hasClass('paused') && bgMusic.paused) {
                    bgMusic.play();
                }
            }
        });

        // hide loading animation since everything is ready
        $('.loading-overlay').slideUp();

        //游戏初始化
        getInfoFromServer();

        $('.start-btn').click(function () {
                startGame();
            });
    });
}());
