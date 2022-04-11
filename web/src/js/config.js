let tbody = document.querySelector("#devices-div > div > div > table > tbody");
var actions = 
  `<a class="add"><i class="material-icons">save</i></a>` + //  - data-toggle="tooltip" data-original-title="Save"
  `<a class="edit"><i class="material-icons"></i></a>` + //  - data-toggle="tooltip" data-original-title="Edit"
  `<a class="delete"><i class="material-icons"></i></a>`; //  - data-toggle="tooltip" data-original-title="Delete"

inputSize = (i) => {
  i.style = "max-width: "+ (parseInt(i.value.length) + 3) + "ch;";
}

refreshDevices = () => {
  tbody.innerHTML = '';
  if(Object.keys(db.devices).length <= 0){
    tbody.innerHTML = "Aucun Appareil";
    updateFlashMsg("Vous n'avez aucun appareil de configuré, veuillez en créer un !", "warning");
  }else {
    for (let i in db.devices) {
      const device = db.devices[i];
      let element = `
      <tr id="${device.id}" ${device.disabled ? 'class="text-muted"' : ''}>
        <td data-type="id">${device.id}</td>
        <td>${device.name}</td>
        <td>${device.ip}</td>
        <td>${device.port || "2222"}</td>
        <td data-type="checkbox"><input class="form-check-input" id="device-checkbox" type="checkbox" data-original-title="checkbox" ${device.disabled ? 'checked' : ''}></td>
        <td>
          ${actions}
        </td>
      </tr>
      `;
      tbody.innerHTML += element;
    }
  }
}

var hostdomain = document.querySelector("#hostdomain");
var hostport = document.querySelector("#hostport");
refreshConfig = () => {
  hostdomain.value = db.config.host;
  hostport.value = db.config.port;
  inputSize(hostdomain)
  inputSize(hostport)
}

updateHost = () => {
  postReq("/updateconfig", {host: hostdomain.value, port: hostport.value});
  updateFlashMsg("Adresse de connexion mise à jour avec succès !");
  window.location.href = `http://${hostdomain.value}:${hostport.value}/?config/?hostupdated`;
}

if (pageUrl == "config") {
  if(UrlArguments && UrlArguments.includes("firstconfig")){
    updateFlashMsg("Vous n'avez aucun appareil de configuré, veuillez en créer un !", "warning");
  }
  $(document).ready(function () {
    
    // Append table with add row form on add new button click
    $(".add-new").click(function () {
      $(this).attr("disabled", "disabled");
      var id = parseInt($("table tr:last-child td:first-child").html()) + 1 || 1;
      var index = $("table tbody tr:last-child").index();
      var row = `<tr id="${id}">` +
        `<td data-type="id">${id}</td>` +
        `<td><input type="text" class="form-control form" name="name" id="name" value="TRAPS-" placeholder="nom du périphérique"></td>` +
        `<td><input type="text" class="form-control" name="ip" id="ip" placeholder="Adresse IP" value="192.168.0."></td>` +
        `<td><input type="text" class="form-control" name="port" id="port" placeholder="Port SSH" value="2222"></td>` +
        `<td data-type="checkbox"><input class="form-check-input" type="checkbox" data-original-title="checkbox" checked></td>` +
        `<td>` + actions + `</td>` +
        `</tr>`;
        $("table").append(row);
        $("table tbody tr").eq(index + 1).find(".add, .edit").toggle();
      $('[data-toggle="tooltip"]').tooltip();
    });
    // Add row on add button click
    $(document).on("click", ".add", function () {
      var empty = false;
      var input = $(this).parents("tr").find('input[type="text"]');
      var checkbox = $(this).parents("tr").find('input[type="checkbox"]');
      input.each(function () {
        if (!$(this).val()) {
          $(this).addClass("error");
          empty = true;
        } else {
          $(this).removeClass("error");
        }
      });
      $(this).parents("tr").find(".error").first().focus();
      if (!empty) {
        var inputs = [];
        input.each(function () {
          inputs.push($(this).val());
          $(this).parent("td").html($(this).val());
        });
        var device = {
          id: $(this).parents("tr").find('td:first-child').html(),
          name: inputs[0],
          ip: inputs[1],
          port: inputs[2],
          disabled: checkbox.is(':checked')
        }
        postData("/updatedevice", device);
        updateFlashMsg(`Appareil ${inputs[0]} mis à jour !`);
        db.devices[device.id] = device;
        $(this).parents("tr").find(".add, .edit").toggle();
        $(".add-new").removeAttr("disabled");
        refreshDevices();
      }
    });
    // Edit row on edit button click
    $(document).on("click", ".edit", function () {
      $(this).parents("tr").find("td:not(:last-child)").each(function () {
        if(!$(this).attr("data-type")){
          $(this).html('<input type="text" class="form-control" value="' + $(this).text() + '">');
        }
      });
      $(this).parents("tr").find(".add, .edit").toggle();
      $(".add-new").attr("disabled", "disabled");
    });
    $(document).on("click", "#device-checkbox", function () {
      let id = $(this).parents("tr").find('td:first-child').html();
      let state = $(this).is(':checked');
      db.devices[id].disabled = state;
      getData(`/disabledevice/${id}/${state}`);
      refreshDevices();
    });
    // Delete row on delete button click
    $(document).on("click", ".delete", function () {
      let id = $(this).parents("tr").find('td:first-child').html();
      let name = db.devices[id].name;
      if(confirm(`Supprimer l'appareil ${name} ?`)) {
        $(this).parents("tr").remove();
        $(".add-new").removeAttr("disabled");
        if(db.devices[id]){
          delete db.devices[id];
          getData(`/deletedevice/${id}`);
        }
        updateFlashMsg(`Appareil ${name} supprimé !`);
      }
    });
  });
}