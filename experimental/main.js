// WebSpeech
var recognizing;
var recognition = new webkitSpeechRecognition();

recognition.continuous = true;
recognition.lang = 'ja-JP'
reset();
recognition.onend = onend;

recognition.onresult = function (ev) {
  for (var i = ev.resultIndex; i < ev.results.length; ++i) {
    if (ev.results[i].isFinal) {
      textarea.value += ev.results[i][0].transcript;
      play_synthesis(ev.results[i][0].transcript);
    }
  }
}

function onend() {
  reset()
  recognition.start();
}

function reset() {
  recognizing = false;
  button.innerHTML = "Click to Speak";
}

function toggleStartStop() {
  if (recognizing) {
    recognition.stop();
    reset();
  } else {
    recognition.start();
    recognizing = true;
    button.innerHTML = "Click to Stop";
  }
}


// VOICEVOX, Audio
const ctx = new AudioContext();
async function play_synthesis(text) {
  const speaker_id = 3
  const playSound = ctx.createBufferSource();
  let response

  const encoded_text = encodeURI(text)
  response = await fetch("http://localhost:50021/audio_query?speaker="+speaker_id+"&text="+encoded_text,{
    method: 'post',
    body: null
  });

  const audio_query_json = await response.json();
  response = await fetch("http://localhost:50021/synthesis?speaker="+speaker_id,{
    method: 'post',
    headers: {"accept": "audio/wav", 'Content-Type': 'application/json'},
    body: JSON.stringify(audio_query_json)
  });

  let arrayBuffer = await response.arrayBuffer()
  let audio = await ctx.decodeAudioData(arrayBuffer)

  playSound.buffer = audio;
  playSound.connect(ctx.destination)
  playSound.start(ctx.currentTime)
}
