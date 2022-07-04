const express=require("express");
const app=express();
const cors=require("cors");
const multer = require("multer");
const {spawn} = require('child_process');
const { Deepgram } = require("@deepgram/sdk");
const YoutubeMp3Downloader = require('youtube-mp3-downloader');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
const fs=require("fs")
const extractAudio = require('ffmpeg-extract-audio')
const getSubtitles=require("youtube-captions-scraper").getSubtitles;
const deepgramApiKey = "44c7bc105df37df6c2c8546d3946757a22047ad2";
const file = "../audio/abc.mp3";
const mimetype = "audio/mp3";

const YD=new YoutubeMp3Downloader({
    ffmpegpath:ffmpeg,
    outputPath:'./audio/',
    youtubeVideoQuality: 'highestaudio'
})

const deepgram = new Deepgram(deepgramApiKey);

source = {
    buffer: file,
    mimetype: mimetype,
};

const port=process.env.PORT || 5000;
var dataToSend;

const storage=multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'videos/')
    },
    filename: function (req, file, cb) {
        cb(null, 'abc.mp4') 
    }
});

const upload = multer({'storage':storage});

app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
    res.send("Hi");
});

app.post("/url",async(req,res)=>{
    const url=new URL(req.body.url);
    const videoID=url.searchParams.get('v');
    console.log(url.searchParams.get('v'));
    let transcript=''
    getSubtitles({
        videoID: videoID,
        lang: 'en'
    }).then(captions => {
        captions.forEach(c => {
            transcript=transcript + c.text + '.';
        });
        console.log(transcript);
        fs.writeFileSync("sample.txt",transcript,()=>'Wrote');
        const pythonSummarizer = spawn('python', ['yt_transcript.py']);
        pythonSummarizer.stdout.on('data', function (data) {
            console.log("fnaifci")
            dataToSend = data.toString();
            console.log(dataToSend);
            res.send(dataToSend);
        });
    });
});
app.post("/video",upload.single('video'),async(req,res)=>{
    console.log(req.body);
    await extractAudio({
        input: './videos/abc.mp4',
        output: './audio/abc.mp3'
    });
    const file = {
        buffer: fs.readFileSync("./audio/abc.mp3"),
        mimetype: 'audio/mp3',
    }
    const options = {
        punctuate: true,
    }
    const result = await deepgram.transcription
        .preRecorded(file, options)
        .catch((e) => console.log(e))
    var transcript;
    try{
        transcript = result.results.channels[0].alternatives[0].transcript
    }catch{
        res.send(err);
    }
    fs.writeFileSync("sample.txt",transcript,()=>'Wrote')
    const pythonSummarizer = spawn('python', ['summarizer.py']);
    pythonSummarizer.stdout.on('data', function (data) {
        dataToSend = data.toString();
        console.log(dataToSend);
        res.send(dataToSend);
    });
});

app.listen(port,()=>{
    console.log("running on port " + port);
});