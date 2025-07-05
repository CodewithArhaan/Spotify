let Folder;
async function getsongs(folder) {
    // fetching the songs
    Folder = folder
    let a = await fetch(`http://127.0.0.1:3000/songs/${folder}`)
    let response = await a.text()


    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    songs = []

    // looping through the as and getting their href where the song is
    for (const element of as) {
        if (element.href.endsWith("mp3")) {
            let songname = element.href.split(`/songs/${folder}`)[1]
            if (songname.startsWith("/")) {
                songname = songname.slice(1)


            }

            songs.push(songname)



        }



    }
    let songsul = document.querySelector(".songslist").getElementsByTagName("ul")[0]

    songsul.innerHTML = ""

    songs.forEach((song) => {
        songsul.innerHTML += `<li>
        <img class="invert" src="svg/music.svg" alt="music">
        <div class="songinfo">
        <div>${decodeURIComponent(song)}</div> 
        
        
        </div>
                        <div class="playnow">
                        
                        <span>Play now</span>
                        <img class="invert" src="svg/play.svg" alt="play">
                        </div>
                        </li>`
    });

    Array.from(document.querySelector(".songslist").getElementsByTagName("li")).forEach(e => {

        // attaching event listeners to each song

        e.addEventListener("click", () => {


            let clickedsong = e.querySelector(".songinfo").firstElementChild.innerHTML.trim()


            playmusic(clickedsong)
            let musicinfo = document.querySelector(".musicinfo")

            // showing the name of song and duration in playbar
            musicinfo.innerHTML = `<div>${e.querySelector(".songinfo").firstElementChild.innerHTML.trim()}</div>`
            play.src = "svg/pause.svg"

            document.querySelector(".volume").style.display = "flex"




        })



    });




}

// displaying the playlist from the folders

async function showplaylist() {
    let a = await fetch("http://127.0.0.1:3000/songs/")
    let response = await a.text()

    let div = document.createElement("div")
    div.innerHTML = response
    let anchor = div.getElementsByTagName("a")
    Array.from(anchor).forEach(async e => {
        if (e.href.includes("/songs")) {

            let folders = e.href.split("/").slice(-2)[0]

            // displaying the meta deta of the folders
            let a = await fetch(`http://127.0.0.1:3000/songs/${folders}/info.json`)
            let response = await a.json()
            document.querySelector(".cardslist").innerHTML += `<div class="cardcontainer" data-folder="${folders}">
                        <div class="card">
                            <div class="play">

                                <svg width="50" height="50" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="50" cy="50" r="48" fill="green" />
                                    <polygon points="40,30 70,50 40,70" fill="black" />
                                </svg>
                            </div>

                            <img src="/songs/${folders}/cover.jpg" alt="card">


                        </div>
                        <div class="cardtext">

                            <h2>${response.title}</h2>
                            <p>${response.description}</p>
                        </div>
                    </div>`

            //adding event listner to playlist to display songs in it
            Array.from(document.querySelectorAll(".cardcontainer")).forEach(element => {
                element.addEventListener("click", async (item) => {


                    var songs = await getsongs(`${item.currentTarget.dataset.folder}`)





                })
            })
        }

    });




}

function secondstominutes(seconds) {
    let minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    if (minutes >= 60) {
        let hours = Math.floor(minutes / 60)
        minutes = minutes % 60
        return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
}

let currentsong = new Audio()
currentsong.preload = "auto"

function playmusic(track) {
    if (!currentsong.paused) {
        currentsong.pause()
    }
    track = track.replace("/", " ").trim()


    currentsong.src = `/songs/${Folder}/` + track
    currentsong.play()

}
async function main() {

    await getsongs("Gym")

    // by deafult if user clicked on play button the first song will start playing
    playmusic(songs[0])
    document.querySelector(".musicinfo").innerHTML = `<div>${decodeURIComponent(songs[0])}</div>`
    document.querySelector(".songtime").innerHTML = "00:00/00:00"

    document.querySelector(".volume img").innerHTML.src = "svg/volume.svg"
    document.querySelector(".volume").style = "display:flex"



    showplaylist()





    // attaching event listeners to play
    let play = document.getElementById("play")
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "svg/pause.svg"

        }

        else {
            currentsong.pause()
            play.src = "svg/play.svg"
        }
    })

    // attaching event listeners to update the songtime
    let songtime = document.querySelector(".songtime")
    currentsong.addEventListener("timeupdate", () => {
        // displaying song duration and upadating current time
        if (!isNaN(currentsong.duration)) {
            songtime.innerHTML = `${secondstominutes(currentsong.currentTime)}/${secondstominutes(currentsong.duration)}`
            // writing logic for  seekbar to show the progress of the song
            let progress = (currentsong.currentTime) / (currentsong.duration) * 100
            circle.style.left = `${progress}%`
            circle.style.transition = "left 0.5s ease-in-out";
        } else {
            songtime.innerHTML = `${secondstominutes(currentsong.currentTime)}/00:00`

        }

    })

    // adding event listener to update seekbar postion when clicked
    let seekbar = document.querySelector(".seekbar")
    let circle = document.querySelector(".circle")
    seekbar.addEventListener("click", (e) => {


        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        circle.style.left = `${percent}%`
        // updating the song
        currentsong.currentTime = (currentsong.duration) * percent / 100
    })




    // adding event listener to update seekbar postion when drag
    let isdragging = false
    circle.addEventListener("mousedown", () => {
        isdragging = true
    })


    document.addEventListener("mousemove", (e) => {
        if (isdragging === true) {

            offsetx = e.clientX - seekbar.getBoundingClientRect().left
            let percent = (offsetx / seekbar.getBoundingClientRect().width) * 100
            circle.style.transition = "left 0.1s linear";
            circle.style.transition = "right 0.1s linear";
            circle.style.left = `${percent}%`
            currentsong.currentTime = (currentsong.duration) * percent / 100


        }
    })
    document.addEventListener("mouseup", () => {
        isdragging = false
    })

    // adding event for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // adding event for close
    document.getElementById("cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"

    })

    //adding event listener to next button
    document.getElementById("next").addEventListener("click", () => {
        play.src = "svg/pause.svg"
        let index = songs.indexOf(currentsong.src.split(`/songs/${Folder}/`)[1])
        index++

        if (index < songs.length) {

            document.querySelector(".musicinfo").innerHTML = decodeURIComponent(songs[index])
            document.querySelector(".musicinfo").style.color = "rgb(0, 0, 0)"
            playmusic(songs[index])
        }
        else if (index >= songs.length) {
            playmusic(currentsong.src = songs[0])
            document.querySelector(".musicinfo").innerHTML = decodeURIComponent(songs[0])
            document.querySelector(".musicinfo").style.color = "rgb(0, 0, 0)"
            playmusic(songs[0])

        }


    })

    // adding event listener to previous button
    document.getElementById("previous").addEventListener("click", () => {
        play.src = "svg/pause.svg"
        let index = songs.indexOf(currentsong.src.split(`/songs/${Folder}/`)[1])
        index--
        if (index < songs.length && index >= 0) {

            document.querySelector(".musicinfo").innerHTML = decodeURIComponent(songs[index])
            document.querySelector(".musicinfo").style.color = "rgb(0, 0, 0)"
            playmusic(songs[index])
        }


    })


    //adding event listener to volume
    document.getElementById("volcontrol").value = "100"
    document.getElementById("volcontrol").addEventListener("input", (e) => {

        currentsong.volume = e.target.value / 100

        if (e.target.value >= 65) {
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "svg/volume.svg"
        }
        else if (e.target.value <= 50) {
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "svg/volume.half.svg"
        }
        if (e.target.value == 0) {
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "svg/mute.svg"
        }



    })
    //adding event mute and unmute the song 
    document.querySelector(".volume").getElementsByTagName("img")[0].addEventListener("click", (e) => {


        let volumebutton = document.querySelector(".volume").getElementsByTagName("img")[0]

        if (currentsong.volume > 0) {
            currentsong.volume = 0
            document.getElementById("volcontrol").value = 0
            volumebutton.src = "svg/mute.svg"
        }
        else if (currentsong.volume == 0) {
            currentsong.volume = 1
            document.getElementById("volcontrol").value = 100
            volumebutton.src = "svg/volume.svg"
        }






    })



};


main()
