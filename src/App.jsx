import { useRef, useState, useEffect } from "react"
import * as faceapi from "@vladmandic/face-api"

function App() {
  let camera = useRef(null)
  let [mood, setMood] = useState(null)
  let [allMood, setAllMood] = useState(null)
  let [text, setText] = useState("Turn on camera")
  let [age, setAge] = useState(0)
  let [gender, setGender] = useState(null)
  let [gender_pr, setGenderPr] = useState(null)

  useEffect(() => {
    let startApp = async () => {
      try {
        let MODEL_URL = "https://raw.githubusercontent.com/vladmandic/face-api/master/model"

        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        await faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL)

        setMood()

        // Turn on
        let stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (camera.current) {
          camera.current.srcObject = stream
        }
      } catch (err) {
        console.error(err)
        setMood(err)
      }
    }
    startApp()
  }, [])

  let handleVideoPlay = () => {
    setInterval(async () => {
      if (camera.current && !camera.current.paused) {
        let detections = await faceapi
          .detectAllFaces(camera.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions()
          .withAgeAndGender()

        if (detections && detections.length > 0) {
          let expressions = detections[0].expressions
          setAllMood(expressions)
          // console.log(detections)

          let best = Object.keys(expressions).reduce((a, b) =>
            expressions[a] > expressions[b] ? a : b
          )
          setMood(best)

          setAge(Math.round(detections[0].age))

          setGender(detections[0].gender)
          setGenderPr(Math.round(detections[0].genderProbability * 100))
          setText('')
        }
      }
    }, 2000)
  }

  return (
    <div className="bg-gray-950 min-h-screen flex flex-col items-center justify-start gap-8 px-5 max-md:gap-3">
      <header className="w-full min-h-23 flex items-center gap-3 max-md:min-h-19">
        <img src="/icons.png" className="rounded-[50%] w-12 h-12 object-cover" alt="" />
        <h1 className="text-white font-bold text-2xl ">Face<span className="text-cyan-400">Mood</span></h1>
      </header>
      <main className="w-full h-full flex items-start justify-between gap-3 max-md:flex-col max-md:gap-4">
        <div className=" group min-h-121.25 min-w-[45%] max-md:max-h-90 max-md:min-h-min max-md:w-full">
          <video
            ref={camera}
            onPlay={handleVideoPlay}
            autoPlay
            muted
            playsInline
            className="rounded-xl border-2 border-white/10 min-h-121.25 max-md:min-h-min h-full object-cover w-full shadow-[0_0_40px_rgba(34,211,238,0.1)]"
          />
        </div>
        <section className="bg-cyan-500/10 border border-cyan-500/30 px-10 py-4 pb-7 rounded-xl w-1/2 flex flex-col items-start justify-between gap-5 h-full shadow-[0_0_40px_rgba(34,211,238,0.1)] max-md:w-full">
          <p className="text-white font-bold text-xl text-center">{text}</p>

          {/* mood */}
          <div className="w-full">
            <p className="text-white text-lg font-semibold tracking-tighter">
              Mood : <span className={`capitalize ${allMood ? 'text-cyan-400 ' : "text-gray-500 font-semibold tracking-[0.5px]"}`}>{allMood ? mood : 'Scanning...'}</span>
            </p>
            <ul className="px-3">
              {allMood ? (
                Object.entries(allMood).map(([emotion, value]) => (
                  <li key={emotion} className="text-white flex justify-between border-b border-white/5 py-1">
                    <span className="capitalize">{emotion}:</span>
                    <span className="text-cyan-400">
                      {Math.round(value * 100)}%
                    </span>
                  </li>
                ))
              ) : null}
            </ul>
          </div>

          {/* age */}
          <div>
            <p className="text-white text-lg font-semibold tracking-tighter">
              Age : <span className={`capitalize ${age ? 'text-cyan-400 ' : "text-gray-500 font-semibold tracking-[0.5px]"}`}>
                {age || 'Scanning...'}
              </span>
            </p>
          </div>

          {/* gender */}
          <div className="w-full">
            <p className="text-white text-lg font-semibold tracking-tighter">
              Gender : <span className={`capitalize ${gender ? 'text-cyan-400 ' : "text-gray-500 font-semibold tracking-[0.5px]"}`}>
                {gender || 'Scanning...'}</span></p>
            {
              gender ? (
                <ul className="w-full px-3">
                  <li className="text-white flex justify-between border-b border-white/5 py-1 capitalize">
                    {gender}
                    <span className="text-cyan-400">
                      {gender_pr}%
                    </span>
                  </li>
                  <li className="text-white flex justify-between border-b border-white/5 py-1">
                    {gender == 'female' ? 'Male' : 'Female'}
                    <span className="text-cyan-400">
                      {100 - gender_pr}%
                    </span>
                  </li>
                </ul>
              ) : null
            }
          </div>

        </section>

      </main>
      <p className="text-gray-500 text-xs uppercase tracking-widest max-md:py-8 text-center">
        Real-time Face, Age, Gender Recognition
      </p>
    </div >
  )
}

export default App;