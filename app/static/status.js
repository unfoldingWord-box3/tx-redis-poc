var $loading;

$(document).ready(() => {
  $loading = $('#loading').hide();
  if ($('#repo').val() || $('#ref').val() || $('#event').val() || $('#job-id').val()) {
    filterTable();
  }
})

var filterTableCallID;

function filterTable(repo, ref, dcs_event) {
  var queryParams = new URLSearchParams();

  var $repo = $("#repo");
  var $ref = $("#ref");
  var $event = $("#event");
  var $job_id = $("#job-id");

  if (repo) {
    $repo.val(repo)
  }
  if (ref) {
    $ref.val(ref)    
  }
  if (dcs_event) {
    $event.val(dcs_event)    
  }

  if ($repo.val()) {
    queryParams.set("repo", $repo.val());
  }
  if ($ref.val()) {
    queryParams.set("ref", $ref.val());
  }
  if ($event.val()) {
    queryParams.set("event", $event.val());
  }
  if ($job_id.val()) {
    queryParams.set("job_id", $job_id.val());
  }
  history.replaceState(null, null, "?"+queryParams.toString());

    var searchCriteria = {
      repo: $repo.val(),
      ref: $ref.val(),
      event: $event.val(),
      job_id: $job_id.val(),
      show_canceled: $("#show-canceled").is(":checked"),
    };
    console.log(searchCriteria)

    var $statusMessage = $("#status-message")
    var $refresh = $("#refresh");
    var $statusTable = $("#status-table");

    $loading.show();
    $statusMessage.html("");
    clearTimeout(filterTableCallID);
    $.ajax({
      type: "POST",
      url: "/get_status_table",
      data: JSON.stringify(searchCriteria),
      contentType: "application/json",
      dataType: 'json',
      success: function(result) {
        $statusTable.html(result.table);
        if ($refresh.val() && $refresh.val() != "0") {
          filterTableCallID = setTimeout(filterTable, $refresh.val()*1000);
        }
      },
      error: function(result) {
        $statusMessage.html("ERROR OCCURRED!");
        console.log(result);
      },
      complete: function(result) {
        $loading.hide();
      }
    });
  }

  function queueJob() {
    var payload = $("#payload");
    var dcs_event = $("#dcs-event");
    var $statusMessage = $("#status-message");
    var submitData = {
      payload: payload.val(),
      event: dcs_event.val(),
    };
    $loading.show();
    $.ajax({
      type: "POST",
      url: "/",
      headers: {
        'X-Gitea-Event': dcs_event.val()
      },
      data: payload.val(),
      contentType: "application/json",
      success: function(result) {
        $statusMessage.html(result.message);
        filterTable();
      },
      error: function(result) {
        $statusMessage.html("ERROR: "+result.error);
        console.log("ERROR!");
        console.log(result);
      },      
      complete: function(result) {
        $loading.hide();
      }
    });
}