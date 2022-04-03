var msgFlash = document.querySelector(".messages-flash");
flashMsg = () => {
  db.flash.forEach((f) => {
    let msg = `
    <div class="alert alert-${f.t} flashmsh" role="alert">
      ${f.msg}
      <button type="button" class="close-btn" data-dismiss="alert" aria-label="Close" onclick="closeFlashMsg()">
        <span aria-hidden="true">×</span>
      </button>
    </div>`;
    msgFlash.insertAdjacentHTML("beforeend", msg);
    db.flash.splice(db.flash.indexOf(f), 1);
  })
}

resetFlashMsg = () => {
  msgFlash.innerHTML = "";
  db.flash = [];
}

newFlashMsg = (msg, type = "success") => {
  db.flash.push({msg, t: type});
  flashMsg();
}

updateFlashMsg = (msg, type = "success") => {
  resetFlashMsg();
  newFlashMsg(msg, type);
}

closeFlashMsg = () => {
  msgFlash.innerHTML = "";
}