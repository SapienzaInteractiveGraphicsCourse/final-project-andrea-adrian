function loadHome(){
    localStorage.audio = 1;
    localStorage.level = "Easy";
    localStorage.name = "Player"
    document.getElementById('comm2').style.display='none';
    document.getElementById('sett2').style.display='none';
    document.getElementById('comm').addEventListener("click",function(){
        document.getElementById('comm2').style.display='block';
        document.getElementById('sett2').style.display='none';
    });
    document.getElementById('sett').addEventListener("click",function(){
        document.getElementById('sett2').style.display='block';
        document.getElementById('comm2').style.display='none';
    });
    document.getElementById('lev').addEventListener("change",function(e){
        document.getElementById('aud').innerHTML = 'Audio Level : '+e.target.value;
        localStorage.audio = e.target.value;
    });
    document.getElementById('username').addEventListener('change',function(e){
        localStorage.name = e.target.value;
    })
    document.getElementById('sou').addEventListener("click",function(){
        if(document.getElementById('imm').className == "u-logo-image u-logo-image-1 sound"){
            document.getElementById('imm').src="./resources/libs/jquery/images/off.jpg";
            document.getElementById('imm').className = "u-logo-image u-logo-image-1 off";
            document.getElementsByTagName('audio')[0].pause();
        }
        else{
            document.getElementById('imm').src="./resources/libs/jquery/images/sound.png";
            document.getElementById('imm').className = "u-logo-image u-logo-image-1 sound";
            document.getElementsByTagName('audio')[0].play();
        }
    });
}
