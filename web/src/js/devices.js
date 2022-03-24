let tbody = document.querySelector("#devices-div > div > div > table > tbody");
refreshDevices = () => {
  tbody.innerHTML = '';
  for (let i in db.devices) {
    const device = db.devices[i];
    let element = `
    <tr id="${device.id}" ${device.disabled ? 'class="text-muted"' : ''}>
      <td data-type="id">${device.id}</td>
      <td>${device.name}</td>
      <td>${device.ip}</td>
      <td data-type="checkbox"><input class="form-check-input" id="traps-checkbox" type="checkbox" data-original-title="checkbox" ${device.disabled ? 'checked' : ''}></td>
      <td>
        <!-- <a class="add" title="" data-toggle="tooltip" data-original-title="Add"><i class="material-icons"></i></a> -->
        <a class="add" title="" data-toggle="tooltip" data-original-title="Save"><i class="material-icons">save</i></a>
        <a class="edit" title="" data-toggle="tooltip" data-original-title="Edit"><i
            class="material-icons"></i></a>
        <a class="delete" title="" data-toggle="tooltip" data-original-title="Delete"><i
            class="material-icons"></i></a>
      </td>
    </tr>
    `;
    tbody.innerHTML += element;
  }
}

if (pageUrl == "devices") {
  $(document).ready(function () {
    
    $('[data-toggle="tooltip"]').tooltip();
    var actions = $("table td:last-child").html();
    // Append table with add row form on add new button click
    $(".add-new").click(function () {
      $(this).attr("disabled", "disabled");
      var id = parseInt($("table tr:last-child td:first-child").html()) + 1;
      var index = $("table tbody tr:last-child").index();
      var row = `<tr id="${id}">` +
        `<td data-type="id">${id}</td>` +
        `<td><input type="text" class="form-control form" name="name" id="name" value="TRAPS-?" placeholder="nom du périphérique"></td>` +
        `<td><input type="text" class="form-control" name="ip" id="ip" placeholder="Adresse IP" value="192.168.0.?"></td>` +
        `<td data-type="checkbox"><input class="form-check-input" type="checkbox" data-original-title="checkbox"></td>` +
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
          disabled: checkbox.is(':checked')
        }
        postData("/updatedevice", device);
        $(this).parents("tr").find(".add, .edit").toggle();
        $(".add-new").removeAttr("disabled");
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
    $(document).on("click", "#traps-checkbox", function () {
      let id = $(this).parents("tr").find('td:first-child').html();
      let state = $(this).is(':checked');
      if(state){

      }
      db.devices[id].disabled = state;
      getData(`/disabledevice/${id}/${state}`);
      refreshDevices();
    });
    // Delete row on delete button click
    $(document).on("click", ".delete", function () {
      let id = $(this).parents("tr").find('td:first-child').html();
      $(this).parents("tr").remove();
      $(".add-new").removeAttr("disabled");
      delete db.devices[id];
      getData(`/deletedevice/${id}`);
    });
  });
}