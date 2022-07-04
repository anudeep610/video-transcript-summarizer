import { useState } from "react";
import {Form, Button, Container} from "react-bootstrap";
import axios from "axios";
import { Circles } from  'react-loader-spinner';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import './App.css';

function App() {

  const [url,setUrl]=useState("");
  const [vid,setvid]=useState('');
  const [disUrl,setDisUrl]=useState(false);
  const [disVid,setDisVid]=useState(false);
  const [valid,setValid]=useState();
  const [loading,setLoading]=useState(false);
  const [text,setText]=useState('');

  const handleUrl=(e)=>{
    const val=e.target.value;
    if(val===""){
      setDisVid(false);
    }else{
      setUrl(val);
      setDisVid(true);
    }
  }

  const handleVid=(e)=>{
    if(e.target.value===""){
      setDisUrl(false);
    }else{
    setvid(e.target.files[0]);
    setDisUrl(true);
    }
  }

  const handleSave=(e)=>{
    e.preventDefault();
    if(url===""){
      let form=new FormData();
      form.append('video',vid);
      setLoading(true);
      setText('loading....')
      axios({
        method:'POST',
        url:'http://localhost:5000/video',
        data:form,
        headers: {'Content-Type': 'multipart/form-data' }
      })
      .then(res=>console.log(setText(res.data)))
      .catch(err=>console.log(setText(err)));
      setvid();
      setLoading(false)
      setDisUrl(false);
    }else{
      try{
        var sentUrl=new URL(url);
        setLoading(true);
        setText('loading....');
        if(sentUrl.hostname==="www.youtube.com"){
            axios.post("http://localhost:5000/url",{url:url})
            .then(res=>setText(res.data))
            .catch(err=>console.log(setText(err)));
        }else{
          throw "not a valid url"
        }
        setValid("");
      }catch(e){
        setValid("Please enter a valid url");
      }
      setUrl("");
      setLoading(false);
      setDisVid(false);
    }
  }

  return (
    <div className="App">
      <Container className="main">
        <Form>
          <Form.Group className="mb-3" controlId="formBasicurl">
            <Form.Label>Enter a youtube URL</Form.Label>
            <Form.Control disabled={disUrl} onChange={handleUrl} value={url} type="text" placeholder="Enter url" />
          </Form.Group>
          <p>{valid}</p>
          <div className="hr">
            <p>OR</p>
          </div>
          <Form.Group className="mb-3" controlId="formbasicupload">
            <Form.Label>Upload a video</Form.Label>
            <Form.Control disabled={disVid} onChange={handleVid} type="file" placeholder="Upload a video"></Form.Control>
          </Form.Group>
          <Button onClick={handleSave} variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      </Container>
      {loading===true? <Circles color="#00BFFF" height={80} width={80}/> : <></>}
      <div className="summary">
          <p className="summary"> {text} </p>
      </div>
    </div>
  );
}

export default App;