const jsPsych = initJsPsych({
    display_element: 'jspsych-target',
    override_safe_mode: true,
    on_finish: function() {
        jsPsych.data.displayData();
        jsPsych.data.get().localSave('csv', 'exp_data.csv');
    }
});


document.addEventListener('click', () => {
    if (jsPsych.audioContext) {
        jsPsych.audioContext.resume();
    }
});

var timeline = [];

var welcome = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<p class="instructions">欢迎您参与我们的实验。请按任意键进入试验阶段。</p>'
};
timeline.push(welcome);

var instructions = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <p class="instructions">在接下来的实验任务中，你将会看到屏幕上显示不同的<strong>情绪词汇</strong>。</p>
        <p class="instructions">如积极词汇“开心”、“愉悦”、“激动”；消极词汇“生气”、“悲伤”、“懊悔”。</p>
        <p class="instructions">您的任务是判断这些词汇的类别（积极/消极），对它们的<strong>类别</strong>进行反应。</p>
        <p class="instructions"><strong>积极词汇按"f" ，消极词汇按"j" 。</strong></p>
        <p class="instructions">如清楚上述说明，则请按任意键开始实验。</p>
    `
};
timeline.push(instructions);

var stimulus = [
    { word: '生气', color: 'black', category: 'negative' },
    { word: '兴奋', color: 'black', category: 'positive' },
    { word: '沮丧', color: 'black', category: 'negative' },
    { word: '愤怒', color: 'black', category: 'negative' },
    { word: '欣喜', color: 'black', category: 'positive' },
    { word: '愉悦', color: 'black', category: 'positive' },
    { word: '欢乐', color: 'black', category: 'positive' },
    { word: '激动', color: 'black', category: 'positive' },
    { word: '懊悔', color: 'black', category: 'negative' },
    { word: '不安', color: 'black', category: 'negative' }
];

var fixation = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<div style="font-size: 50px; color: red; display: flex; justify-content: center; align-items: center;">+</div>',
    choices: "NO_KEYS",
    trial_duration: function(){
      return jsPsych.randomization.sampleWithoutReplacement([250, 500, 750, 1000, 1250], 1)[0];
    },
    data: {
      task: 'fixation'
    }
  };

var trials = [];
for (var i = 0; i < stimulus.length; i++) {
    for (var j = 0; j < 20; j++) {
        trials.push({
            stimulus: `<p class="stimulus" style="color:${stimulus[i].color};">${stimulus[i].word}</p>`,
            data: {
                word: stimulus[i].word,
                color: stimulus[i].color,
                category: stimulus[i].category
            }
        });
    }
}

trials = jsPsych.randomization.shuffle(trials);

var trial = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: jsPsych.timelineVariable('stimulus'),
    choices: ['f','j'],
    data: jsPsych.timelineVariable('data'),
    on_finish: function(data){
        var correct = false;
        if ((data.category === 'positive' && data.response === 'f') ||
            (data.category === 'negative' && data.response === 'j') ) {
            correct = true;
        }
        data.correct = correct;
    }
};

var test_procedure = {
    timeline: [fixation,trial],
    timeline_variables: trials,
    repetitions: 1,
    randomize_order: true
};
timeline.push(test_procedure);

var debrief = {
    type: jsPsychHtmlKeyboardResponse,
      stimulus: function() {

        var trials = jsPsych.data.get().filter({task: 'response'});
        var correct_trials = trials.filter({correct: true});
        var accuracy = Math.round(correct_trials.count() / trials.count() * 100);
        var rt = Math.round(correct_trials.select('rt').mean());
        return `<p>实验结束！感谢参与！</p><p>你的正确率是 ${accuracy}%.</p><p>按任意键结束。</p>`;
    }
};
timeline.push(debrief);

// Run the experiment
jsPsych.run(timeline);
