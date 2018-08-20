lat = "";
lng = "";

//Fetch initial location
$(document).ready( function() {
    $.get("http://ip-api.com/json",
        function(data,statusTxt,xhr){
            
            lat = data.lat;
            lng = data.lon;
            
            initAutocomplete(document.getElementById("Enterlocation").id);         
        }
    );
});


//prevent page refresh
$('#searchform').click(function(event){
    event.preventDefault();
})

//clear the body
function clearForm()
{
  document.getElementById("results").innerHTML = '';
}

//Autocomplete
var placeSearch, autocomplete;
var componentForm = {
  street_number: 'short_name',
  route: 'long_name',
  locality: 'long_name',
  administrative_area_level_1: 'short_name',
  country: 'long_name',
  postal_code: 'short_name'
};

function initAutocomplete(id) {

  if(id == "for")
  {
      a = document.getElementById('for');
  }
  else if(id == "Enterlocation")
  {
     a = document.getElementById('Enterlocation');
  }

  autocomplete = new google.maps.places.Autocomplete(

      /** @type {!HTMLInputElement} */(a),
      {types: ['geocode']});
  autocomplete.addListener('place_changed', fillInAddress);
}

function fillInAddress() {
  
  var place = autocomplete.getPlace();

  for (var component in componentForm) {
    document.getElementById(component).value = '';
    document.getElementById(component).disabled = false;
  }

  for (var i = 0; i < place.address_components.length; i++) {
    var addressType = place.address_components[i].types[0];
    if (componentForm[addressType]) {
      var val = place.address_components[i][componentForm[addressType]];
      document.getElementById(addressType).value = val;
    }
  }
}

function geolocate() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var geolocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      var circle = new google.maps.Circle({
        center: geolocation,
        radius: position.coords.accuracy
      });
      autocomplete.setBounds(circle.getBounds());
    });
  }
}

var pagination = [];
pag_display = "";
//Sending ajax request to get nearby places table.
function passlatlng(lat,lng){
      distance = $('#Distance').val();
      
      if(distance==="")
      {
        distance = 16090;
      }
      else
      {
        distance = distance*1609;
      }
      keyword = $('#keyword').val();
      type = $('#Category').val();
      location1 = $('#Enterlocation').val();
      
      if(location1.length!=0) 
        {
          
          homeurl = "http://homework8-env.ew8zmcb2mm.us-east-2.elasticbeanstalk.com/location1/"+location1+"/distance/"+distance+"/keyword/"+keyword+"/type/"+type;
          
        }  
      else{
      homeurl = "http://homework8-env.ew8zmcb2mm.us-east-2.elasticbeanstalk.com/lat/"+lat+"/lng/"+lng+"/distance/"+distance+"/keyword/"+keyword+"/type/"+type;
      
        pagination.unshift(homeurl);
        pagination = pagination.reverse();

       }

      $('.progressOutline').html('<div class="progress"><div id="progressBar" class="progress-bar progress-bar-striped progress-bar-animated" style="width:50%"></div></div>');
    
     $.ajax({

        url: homeurl,
        type:'GET',
        contentType: "application/json",
       
        success:function(response,status,xhr)
        {
             a = response;
             $('.progressOutline').css("display","none");
               nearPlaces(a,1); 
        },
        error: function(xhr,status,error)
        {
          console.log("Inside error block ");
        }
    });
}

//Next 20 records
function Page(flag)
{
    if(flag == 1)
    { 
        if(pag_display.next_page_token)
        {
         token = pag_display.next_page_token;
          url1 =  "http://homework8-env.ew8zmcb2mm.us-east-2.elasticbeanstalk.com/token/"+token;
          pagination.unshift(url1);
          pagination = pagination.reverse();
          $.ajax({
        
          url: url1,
        
          type:'GET',
          contentType: "application/json",
        
          success:function(response,status,xhr)
          {

             outputResponse = response;
             nearPlaces(outputResponse,1);
                 
          },
          error: function(xhr,status,error)
          {
        
          console.log("Inside error block ");
          }
      });
  
      } 
    }

    else
    {
          url1 = undefined;
          if(pagination.length > 1)
          {
            
            pagination = pagination.reverse();
            pagination.shift(url1);


            url1 = pagination[pagination.length -1];
            
            $.ajax({
       
            url: url1,
        
            type:'GET',
            contentType: "application/json",
     
            success:function(response,status,xhr)
            {

             a = response;
             nearPlaces(a,0);
               
            },
            error: function(xhr,status,error)
            {
        

            console.log("Inside error block ");

            }
          });
          } 

    }
}

//highlight that row
function highlight() {
    var table = document.getElementById('data');
    var cells = table.getElementsByTagName('td');

    for (var i = 0; i < cells.length; i++) {
        
        var cell = cells[i];
        
        cell.onclick = function () {
            
            var rowId = this.parentNode.rowIndex;

            var rowsNotSelected = table.getElementsByTagName('tr');
            for (var row = 0; row < rowsNotSelected.length; row++) {
                rowsNotSelected[row].style.backgroundColor = "";
                rowsNotSelected[row].classList.remove('selected');
            }
            var rowSelected = table.getElementsByTagName('tr')[rowId];
            rowSelected.style.backgroundColor = "yellow";
            rowSelected.className += " selected";
        }
    }

}

html_text = "";
count = 0;
html_text_retain ='';
//Display nearest places table
function nearPlaces(placeDetails,arg)
{
  
  html_text = "";
  if(placeDetails.results.length == 0)
  {
        
        html_text+='<div style="margin-top:120px" class="alert alert-warning" role="alert">No Records have been found</div>';      
  }
  else
  {     
        html_text += '<div id="near">';
        html_text += '<table id = "data" class="table table-hover" style="font-size:16px; width:100%;">';
        html_text += '<div style="float:right;"><button id = "detail" type="button" class="btn btn-light" disabled onclick="showDetails()"> Details</button></div>';
        html_text += '<tr><th>#</th>';
        html_text += '<th>Category</th>';
        html_text += '<th class="col-sm-6 ">Name</th>';
        html_text += '<th class="col-sm-6 ">Address</th>';
        html_text += '<th>Favorite</th>';
        html_text += '<th>Details</th></tr>';
        pag_display = placeDetails;         
        n_rows = placeDetails.results;    
        count = 0; 
        for (i = 0; i < n_rows.length; i++) {
        var id; 
        name = n_rows[i]["name"];
        count = count+1;
        current = n_rows[i];
        var keys = Object.keys(current);
        html_text += '<tr>';
        for(j=0; j<keys.length; j++)
            {
              if(keys[j] == "place_id")
                {
                    id = current[keys[j]];
                }
              if(keys[j] == 'geometry')
                {
                     latitude = (current[keys[j]]['location']['lat']);
                     longitude = (current[keys[j]]['location']['lng']);
                }
                  
              }
          html_text += '<td id="'+id+"count"+'">'+count+'</td>';
          html_text += '<td id="'+id+"icon"+'"><img src="' + n_rows[i]["icon"] +'" style="height:25px; width:25px;"></td>';
          html_text += '<td id ="'+id+"place"+'" class="col-sm-4 col-md-4" style="white-space: nowrap;">' +n_rows[i]["name"]+ '</td>'; 
          html_text+='<td id ="'+id+"address"+'" class="col-sm-4 col-md-4" style="white-space: nowrap;">'+n_rows[i]["vicinity"]+'</td>';
          html_text+='<td> <button class="'+id+"star"+'" type="button" class="btn btn-default btn-sm" onclick= "Favstorage(this);"><span id="'+id+"123"+'" class="glyphicon glyphicon-star-empty"></span></button></td>';
          html_text+='<td><button type="button" class="btn btn-default btn-sm" id ="'+id+'" onclick="clickPlace(id);highlight();enableDetails(id)"><span class="glyphicon glyphicon-chevron-right"></span></button></td>';
          html_text += '</tr>';
         
        }
          html_text += '</table>';
          html_text += '<div class="form-group row" style="text-align: center;">';
          html_text += '<div class="col-sm-12 col-md-1">&nbsp;</div>';
          html_text += '<button type="button" onclick="Page(0);" id="previous" class="btn" style="margin-left:10px; background-color:transparent;border-color: #ccc;">';
          html_text += 'Previous';
          html_text += '</button>';
          html_text += '<button id="next" type="button" onclick="Page(1);" class="btn" style="margin-left:10px; background-color:transparent; border-color: #ccc;"> Next</button></div>';
          html_text += '</div>';
  }

  html_text_retain = html_text;
  $("#results").html(html_text);

  if(arg == 1){
  if(!placeDetails.next_page_token && pagination.length==1)
  {  
   $('#next').css("visibility","hidden");
   $('#previous').css("visibility","hidden");
  }

  else if(!placeDetails.next_page_token && pagination.length>1)
  {
   $('#next').css("visibility","hidden");
   $('#previous').css("visibility","visible");
  }

  else if(placeDetails.next_page_token && pagination.length>1)
  {
   $('#next').css("visibility","visible");
   $('#previous').css("visibility","visible");
  }

  else if(placeDetails.next_page_token && pagination.length==1)
  {
   $('#next').css("visibility","visible");
   $('#previous').css("visibility","hidden");
  }
 }
 
 else if(arg == 0)
 {
    
    if(placeDetails.next_page_token && pagination.length==1)
            {  
             $('#next').css("visibility","visible");
             $('#previous').css("visibility","hidden");
            }

           else if(placeDetails.next_page_token && pagination.length>1)
           {
           $('#next').css("visibility","visible");
           $('#previous').css("visibility","visible");
           }

 }

}


//enable details
function enableDetails(id)
{     
      id2 = id;
      document.getElementById("detail").disabled = false;   
}

//Fetch Place Details Information
function initMap(placeID) 
{

      if(placeID.includes("apple"))
      {
        placeID = placeID.substring(0,placeID.indexOf("apple"));
        $('#myTable').css({"display":"none"});
      }
      var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -33.866, lng: 151.196},
        zoom: 15
      });

      var infowindow = new google.maps.InfoWindow();
      var service = new google.maps.places.PlacesService(map);

      service.getDetails({
        placeId: placeID
          
      }, function(place, status) {
              

      //checking for info tab
      if(!place.hasOwnProperty('opening_hours') && !place.hasOwnProperty('formatted_address') && !place.hasOwnProperty('international_phone_number')
          && !place.hasOwnProperty('price_level') && !place.hasOwnProperty('rating') && !place.hasOwnProperty('url') && !place.hasOwnProperty('website')
           && !place.hasOwnProperty('opening_hours'))
              {
                 alert("no info");
              }

      else
       { 

              var m = moment();
              var local_time = new Date(m.utc()+place.utc_offset).toString();
              var n;
              if(local_time.includes("Sun")) n=0;
              else if(local_time.includes("Mon")) n=1;
              else if(local_time.includes("Tue")) n=2; 
              else if(local_time.includes("Wed")) n=3;
              else if(local_time.includes("Thu")) n=4;
              else if(local_time.includes("Fri")) n=5;
              else if(local_time.includes("Sat")) n=6;

              var open_close;
              if(!place.hasOwnProperty('opening_hours')){
              }

              else if(place.opening_hours.open_now)
              {  

               open_close = "Open now: "+place.opening_hours.periods[n].open.time+" "+place.opening_hours.periods[n].close.time;
               var o1h = place.opening_hours.periods[n].open.time.substring(0, 2);
               var o1m = place.opening_hours.periods[n].open.time.substring(2, 4);
               var c1h = place.opening_hours.periods[n].close.time.substring(0, 2);
               var c1m = place.opening_hours.periods[n].close.time.substring(2, 4);

               var hourso = o1h > 12 ? o1h - 12 : o1h;
               var am_pmo = o1h >= 12 ? "PM" : "AM";

               var hoursc = c1h > 12 ? c1h - 12 : c1h;
               var am_pmc = c1h >= 12 ? "PM" : "AM";
               console.log(hoursc+":"+c1m+" "+am_pmc); 
               console.log("Open Now:"+hourso+":"+o1m+" "+am_pmo+"-"+hoursc+":"+c1m+" "+am_pmc); 
               open_close =  "Open Now:"+hourso+":"+o1m+" "+am_pmo+"-"+hoursc+":"+c1m+" "+am_pmc+"  ";

               var clickme = " Daily Open Hours";

              }

              else
              {   
               var clickme = " Daily Open Hours";
               open_close = "Closed: ";
              }  
              level=""; 
              if(place.price_level!=undefined)
              {
                for(var i=1; i<=place.price_level; i++)
                {
                     level = level + "\$";
                }
              }
              else
              {
                level=""; 
              }
              
              rating = Math.round(place.rating * 2) / 2;
              let output = [];

         
              for (var i = rating; i >= 1; i--)
                output.push('<i class="fa fa-star" aria-hidden="true" style="color: gold;"></i>&nbsp;');

            
              if (i == .5) output.push('<i class="fa fa-star-half-o" aria-hidden="true" style="color: gold;"></i>&nbsp;');

              
              for (let i = (5 - rating); i >= 1; i--)
                output.push('<i class="fa fa-star-o" aria-hidden="true" style="color: gold;"></i>&nbsp;');

              rating = output.join('');

              phone = place.international_phone_number;
              
              var key = placeID;
              key += '';
              key = key+'place';
              address1 = place.vicinity;
              
              address = place.formatted_address;
              address_comp = place.address_components;
              
              out = place.name;
              detailoutput = ''; 
              detailoutput += '<div id="detailsTable">';
              detailoutput +='<div><h4 style="text-align:center;">'+place.name+'</h4></div>';   
              detailoutput += '<div id="social" style="height: 30px;">';
              //alert(a);
              detailoutput += '<button type="button" class="btn" style="float: left;" id = '+key+' onclick="createDisplay()"><span class="glyphicon glyphicon-chevron-left"></span>List</button>';
              detailoutput += '<a href="https://twitter.com/intent/tweet?text=Check out '+place.name+ ' located at ' + place.formatted_address+'. Website: '+place.website+'TravelAndEntertainmentSearch "><img src="http://cs-server.usc.edu:45678/hw/hw8/images/Twitter.png" height=22px width=22px style="float: right;"/></a>';
              detailoutput += '<button class = "'+placeID+"star"+'" type="button" class="btn btn-default btn-sm" style="float: right;" onclick="Favstorage(this)"><span id="'+placeID+"123"+'" class="glyphicon glyphicon-star-empty"></span></button>';
              
              detailoutput += '</div>';
              
              detailoutput += '<ul class="nav nav-tabs" style="justify-content:flex-end; float:right">';
              detailoutput +=  '<li class="active"><a data-toggle="tab" href="#info">Info</a></li>';
              detailoutput +=  '<li><a data-toggle="tab" href="#photos">Photos</a></li>';
              detailoutput +=  '<li><a data-toggle="tab" href="#maps">Maps</a></li>';
              detailoutput +=  '<li><a data-toggle="tab" href="#reviews" onclick="showreviews()">Reviews</a></li>';
              detailoutput += '</ul>';

              detailoutput += '<div class="tab-content">';


              detailoutput += '<div id="info" class="tab-pane fade in active">';
              detailoutput += '<table class="table table-hover table-striped" style="font-size:14px; width:100%;">';
                
              if(!place.hasOwnProperty('formatted_address')){
                 
              }else{
              detailoutput += '<tr><th style="width:25%;">Address</th><td>'+place.formatted_address+'</td></tr>';
              }

              if(!place.hasOwnProperty('international_phone_number')){
                 
              }else{
              detailoutput += '<tr><th>Phone Number</th><td>'+place.international_phone_number+'</td></tr>';
              }

              if(!place.hasOwnProperty('price_level')){
                 
              }else{
              detailoutput += '<tr><th>Price Level</th><td>'+level+'</td></tr>';
              }

              if(!place.hasOwnProperty('rating')){
                 
              }else{
              detailoutput += '<tr><th>Rating</th><td>'+place.rating+" "+rating+'</td></tr>';
              }

              if(!place.hasOwnProperty('url')){
                 
              }else{
              detailoutput += '<tr><th>Google Page</th><td><a href="'+place.url+'" target="_blank">'+place.url+'</td></tr>';
              }

              if(!place.hasOwnProperty('website')){
                 
              }else{
              detailoutput += '<tr><th>Website</th><td><a href="'+place.website+'" target="_blank">'+place.website+'</td></tr>';
              }
              if(!place.hasOwnProperty('opening_hours')){
                 
              }else{
                
              detailoutput += '<tr><th>Hours</th><td>'+open_close+'<button type="button" class="btn btn-link" data-toggle="modal" data-target="#myModal">'+clickme+'</button></td></tr>';
              detailoutput +=  '<div class="modal fade" id="myModal" role="dialog">';
              detailoutput +=    '<div class="modal-dialog">';       
              detailoutput += '<div class="modal-content">';
              detailoutput +=  '<div class="modal-header">';
              detailoutput +=  '<button type="button" class="close" data-dismiss="modal">&times;</button>';
              detailoutput += '<h4 class="modal-title">Open hours</h4>';
              detailoutput += '</div>';
              detailoutput += '<div class="modal-body">';
              for(var i=0; i<7; i++)
              {
                if(n==0) n = 7;
              else{
                    if(i==0){
                      detailoutput +=  '<p><b>'+place.opening_hours.weekday_text[(n+i-1)%7]+'</b></p>';
                    }
                  else{
                       detailoutput +=  '<p>'+place.opening_hours.weekday_text[(n+i-1)%7]+'</p>';
                  }
               }
              }
       
              detailoutput += '</div>';
              detailoutput += '<div class="modal-footer">';
              detailoutput +=  '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>';
              detailoutput +=  '</div>';
              detailoutput += '</div>';       
              detailoutput += '</div>';
             }

              detailoutput += '</table>';

              detailoutput += '</div>';


                 
     }
        //Photos tab
        detailoutput += '<div id="photos" class="tab-pane fade" style="margin-top:71px"><hr>';
                
        if(!place.hasOwnProperty('photos'))
        {

              detailoutput +='<div style="margin-top:120px" class="alert alert-warning" role="alert">No Records</div></div>';


        }  

        else
        {

              $("#reviewTable").hide();
              detailoutput += '<div class="col-md-12">';
              detailoutput += '<div class="row" style="margin-top:0px">';
              detailoutput += '<div class="gal">';

              for(var i=0; i<place.photos.length; i++)
              {  

              
              detailoutput += '<a href ="'+place.photos[i].getUrl({"maxWidth": place.photos[i].width, "maxHeight": place.photos[i].height})+'" target="_blank"><img src ='+ place.photos[i].getUrl({"maxWidth": 335, "maxHeight": 335})+'></a>';
                
              }
              detailoutput +=  '</div>'; 
              detailoutput +=  '</div></div></div>';


        } //Maps tabs

       detailoutput +=  '<div style="margin-top:30px" id="maps" class="tab-pane">';
      
     
       detailoutput +=  '<div class="form-row">';

       detailoutput +=  '<div class="form-group col-md-4">';
       detailoutput +=  '<label for="for">From</label>';
       detailoutput +=  '<input type="text" class="form-control" id="for" placeholder="Enter Location">';                 
       detailoutput +=  '</div>';
       detailoutput +=  '<div class="form-group col-md-4">';
       detailoutput +=  '<label for="to">To</label>';
       detailoutput +=  '<input type="text" class="form-control" id="to">'; 
       detailoutput +=  '</div>';
       detailoutput +=  '<div class="form-group col-md-2">';
       detailoutput +=  '<label for="travel">Travel Mode</label>';
       detailoutput +=  '<select class="form-control" id="mode">';
       detailoutput +=  '<option value="DRIVING">Driving</option>';
       detailoutput +=  '<option value="WALKING">Walking</option>';
       detailoutput +=  '<option value="BICYCLING">Bicycling</option>';
       detailoutput +=  '<option value="TRANSIT">Transit</option>';
       detailoutput +=  '</select>';
       detailoutput +=  '</div>';
       detailoutput +=  '<div class="form-group col-md-2">';
       detailoutput +=  '<button id = "directions" type="button" class="btn btn-primary" style="margin-top:24px">Get Directions</button>';
       detailoutput +=  '</div>';
       
       detailoutput +=  '</div>';

       detailoutput +=  '<div class="form-row">';
       detailoutput +=  '<div class="form-group col-md-12">';
       detailoutput +=  '<button id="showup" type="button" class="btn btn" onclick="toggleStreetView()"><img src="http://cs-server.usc.edu:45678/hw/hw8/images/Pegman.png" height=30px width=30px></button>';
       detailoutput +=  '</div>';
       detailoutput +=  '</div>';

       detailoutput +=  '<div id = map1 class="form-row" style="height:300px;width:100%">';
       detailoutput +=  '<div class="form-group col-md-12">';
       detailoutput +=  '</div>';
       detailoutput +=  '</div>';

       detailoutput +=  '<div id = infoPanel class="form-row" style="height:300px">';
       detailoutput +=  '</div>';

       detailoutput +=  '</div>';

      //Reviews Tab
      detailoutput +=  '<div id="reviews" class="tab-pane fade">';

      detailoutput +=  '<div class="dropdown" style="margin-top:70px">';
      detailoutput +=  '<button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">Google Reviews<span class="caret"></span></button>';
      detailoutput +=  '<ul class="dropdown-menu" aria-labelledby="dropdownMenuButton">';
      detailoutput +=  '<li><a href="#" data-value="Google Reviews" onclick="showreviews()">Google Reviews</a></li>';
      detailoutput +=  '<li><a href="#" data-value="Yelp Reviews" onclick="showyelpreviews()">Yelp Reviews</a></li>';
      detailoutput +=  '</div>';

      detailoutput +=  '<div class="dropdown" style="margin-left:143px;margin-top:-33px">';
      detailoutput +=  '<button class="btn btn-default dropdown-toggle" type="button" id="dropdownMenuButton1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="true">Default Order<span class="caret"></span></button>';
      detailoutput +=  '<ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">';
      detailoutput +=  '<li><a href="#" data-value="Default" onclick="defaultOrder()">Default Order</a></li>';
      detailoutput +=  '<li><a href="#" data-value="Highest" onclick="Rating(1)">Highest Rating</a></li>';
      detailoutput +=  '<li><a href="#" data-value="Lowest" onclick="Rating(2)">Lowest Rating </a></li>';
      detailoutput +=  '<li><a href="#" data-value="Most" onclick="Rating(3)">Most Recent</a></li>';
      detailoutput +=  '<li><a href="#" data-value="Least" onclick="Rating(4)">Least Recent</a></li>';
      detailoutput +=  '</div>';
      detailoutput +=  '<div id="reviewTable"></div>';
      detailoutput += '</div>';  
      detailoutput += '</div>';

      retain_detailoutput = detailoutput;
                
      $('#near').css({"display":"none"});

      

      
      $("#results").append(detailoutput);
      for(var i=0; i<localStorage.length; i++)
      {
        id = localStorage.key(i);
        id1 = id+"star";
        $("."+id1+" #"+id+"123").removeClass("glyphicon glyphicon-star-empty").addClass("glyphicon glyphicon-star yellow");
      }    

      initMap1(placeID, place); 
                      }
                      );               
      }


     

      //Show details tabs
      function showDetails(){
        
        $("#results").html(retain_detailoutput);
        $('#near').css({"display":"none"});

        for(var i=0; i<localStorage.length; i++)
        {
          id = localStorage.key(i);
          id1 = id+"star";
          $("."+id1+" #"+id+"123").removeClass("glyphicon glyphicon-star-empty").addClass("glyphicon glyphicon-star yellow");
        } 
      }


        //Show nearby places
        function createDisplay()
        {
           if(html_text_retain=='')
           {
              
           } 
          else{
          $("#results").html(html_text_retain);
          $('#detailsTable').css({"display":"none"});

          document.getElementById("detail").disabled = false;
          for(var i=0; i<localStorage.length; i++)
          {
            id = localStorage.key(i);
            id1 = id+"star";
            $("."+id1+" #"+id+"123").removeClass("glyphicon glyphicon-star-empty").addClass("glyphicon glyphicon-star yellow");
          }    

         }

        }



        //Calling the place details
        function clickPlace(id)
            {
                placeID = id;

                initMap(placeID);
             }

        // Request yelp reviews
        function showyelpreviews()
        {

          console.log("Address:"+address);
          console.log(address_comp);

          for(var i=0; i<address_comp.length; i++)
          {
            if(address_comp[i].types[0] == "route")
            {
                address1 = address_comp[i].long_name; 
            }

            else if(address_comp[i].types[0] == "locality")
            {
                city = address_comp[i].long_name;
            }

            else if(address_comp[i].types[0] == "administrative_area_level_1")
            {
                state = address_comp[i].short_name;
            }

            else if(address_comp[i].types[0] == "country")
            {
                country = address_comp[i].short_name;
            }

            else if(address_comp[i].types[0] == "street_number")
            {
                street = address_comp[i].long_name;
            }
          }

          
          address2 =  street+" "+address1;
          address1 = address2;
          phone = phone.replace(/\s/g,'');
          phone = phone.replace(/-/g, '');
          console.log(out);
          console.log("http://homework8-env.ew8zmcb2mm.us-east-2.elasticbeanstalk.com/name/"+encodeURIComponent(out)+"/address1/"+encodeURIComponent(address1)+"/city/"+encodeURIComponent(city)+"/state/"+encodeURIComponent(state)+"/country/"+encodeURIComponent(country)+"/phone/"+phone);
          

          $.ajax({
               
                url: "http://homework8-env.ew8zmcb2mm.us-east-2.elasticbeanstalk.com/name/"+encodeURIComponent(out)+"/address1/"+encodeURIComponent(address1)+"/city/"+encodeURIComponent(city)+"/state/"+encodeURIComponent(state)+"/country/"+encodeURIComponent(country)+"/phone/"+phone,
                
                type:'GET',
                contentType: "application/json",
             
                success:function(response,status,xhr)
                {

                     
                     a2 = response;
                     showyelprev(response);
                     
                       
                },
                error: function(xhr,status,error)
                {
                
                  console.log(url);
                  console.log("Inside error block ");

                }
          });

        }

          //show yelp reviews
          dis= '';
          function showyelprev(a1){
             
             dis = '';
             if(document.getElementById("myTable1")!=null)
            {
               $("#myTable1").remove();
            }
             

              dis  = '<table id = "myTable2" class="table table-bordered table-hover table-stripped" style="font-size:14px; width:100%; ">';
              if(a1==undefined)
              {
                dis+= '<div style="margin-top:120px" class="alert alert-warning" role="alert">No Records</div>';
              }
              else{
             for(var i=0; i<a1.length; i++)
             {
              
                
             rating = Math.round(a1[i].rating * 2) / 2;
               let output = [];

                       
               for (var j = rating; j >= 1; j--)
               output.push('<i class="fa fa-star" aria-hidden="true" style="color: gold;"></i>&nbsp;');

                          
               if (j == .5) output.push('<i class="fa fa-star-half-o" aria-hidden="true" style="color: gold;"></i>&nbsp;');

                            
               for (let j = (5 - rating); j >= 1; j--)
               output.push('<i class="fa fa-star-o" aria-hidden="true" style="color: gold;"></i>&nbsp;');

               rating = output.join('');


              dis += '<tr style="border: light grey">';
              dis += '<td><a href="'+a1[i].url+'" target="_blank"><img src = '+a1[i].user.image_url+' height=20px width=20px></a></td>'; 
              
              

               dis += '<td><a href="'+a1[i].url+'" target="_blank">'+'<p>'+a1[i].user.name+'</a><p>'+rating+' '+a1[i].time_created+'<p>'+a1[i].text+'</td>';
               dis += '<td style="display: none;">'+a1[i].rating+'</td>';
               dis += '<td style="display: none;">'+a1[i].time_created+'</td>';
               dis += '</tr>';
              
               

             }     

            }

             dis += '</table>';


             


             $("#reviewTable").html(dis);
             
            $("#reviewTable").show();




          }






            //Request google reviews
            function showreviews()
            {

            //console.log("http://homework8-env.ew8zmcb2mm.us-east-2.elasticbeanstalk.com/placeid/"+placeID);  
            $.ajax({
                   
                    url: "http://homework8-env.ew8zmcb2mm.us-east-2.elasticbeanstalk.com/placeid/"+placeID,
                    
                    type:'GET',
                    contentType: "application/json",
                 
                    success:function(response,status,xhr)
                    {

                         //a = response;
                         //displayTable1(a);
                         console.log(placeID);
                         console.log(response.result.reviews);
                         a1 = response.result.reviews;
                         showgooglerev(a1);
                           
                    },
                    error: function(xhr,status,error)
                    {
                    

                      console.log("Inside error block ");

                    }
              });

            }



    displayrev = '';
    function showgooglerev(a1){

    displayrev = ''; 
    if(document.getElementById("myTable2")!=null)
    {
     
     $("#myTable2").remove();
    }
     

   displayrev  = '<table id = "myTable1" class="table table-bordered table-hover table-stripped" style="font-size:14px; width:100%; ">';
   if(a1==undefined)
   {
      displayrev+= '<div style="margin-top:120px" class="alert alert-warning" role="alert">No Records</div>';
   } 
   else{
   for(var i=0; i<a1.length; i++)
   {
    
    displayrev += '<tr style="border: light grey">';
    displayrev += '<td><a href="'+a1[i].author_url+'" target="_blank"><img src = '+a1[i].profile_photo_url+' height=20px width=20px></a></td>'; 
    
    rating = Math.round(a1[i].rating * 2) / 2;
     let output = [];

             
     for (var j = rating; j >= 1; j--)
     output.push('<i class="fa fa-star" aria-hidden="true" style="color: gold;"></i>&nbsp;');

                
     if (j == .5) output.push('<i class="fa fa-star-half-o" aria-hidden="true" style="color: gold;"></i>&nbsp;');

                  
     for (let j = (5 - rating); j >= 1; j--)
     output.push('<i class="fa fa-star-o" aria-hidden="true" style="color: gold;"></i>&nbsp;');

     rating = output.join('');

     var time = moment.unix(a1[i].time).format("YYYY-MM-DD HH:mm:ss");

     displayrev += '<td><a href="'+a1[i].author_url+'" target="_blank">'+'<p>'+a1[i].author_name+'</a><p>'+rating+' '+time+'<p>'+a1[i].text+'</td>';
     displayrev += '<td style="display: none;">'+a1[i].rating+'</td>';
     displayrev += '<td style="display: none;">'+a1[i].time+'</td>';
     displayrev += '</tr>';

    


   }     
 }
   displayrev += '</table>';
   $("#reviewTable").html(displayrev);
   $("#reviewTable").show();

}


//sorting in default order
function defaultOrder() {
  if(document.getElementById("myTable2")!=null)
  {
  
   dis = '';
   showyelprev(a2);
  }  

  else
  {
    
    displayrev = '';
    showgooglerev(a1);
  }
  
   
}


function Rating(rtype) {
  var table, rows, switching, i, x, y, shouldSwitch;
  if(document.getElementById("myTable2")!=null)
  {
    table = document.getElementById("myTable2");
  }  

  else
  {
    table = document.getElementById("myTable1");
  }
  switching = true;

  while (switching) {
    
    switching = false;
    rows = table.getElementsByTagName("TR");
    
    for (i = 0; i < (rows.length - 1); i++) {
      
      shouldSwitch = false;
      //highest
      if(rtype==1){
      
      x = rows[i].getElementsByTagName("TD")[2];
      y = rows[i + 1].getElementsByTagName("TD")[2];
      
      if (x.innerHTML < y.innerHTML) {
       
        shouldSwitch= true;
        break;
      }
     }
      //lowest
      else if(rtype==2){
        x = rows[i].getElementsByTagName("TD")[2];
        y = rows[i + 1].getElementsByTagName("TD")[2];
      
        if (x.innerHTML > y.innerHTML) {
       
        shouldSwitch= true;
        break;
      }


    }
     //most
     else if(rtype==3){
        x = rows[i].getElementsByTagName("TD")[3];
        y = rows[i + 1].getElementsByTagName("TD")[3];
      
        if (x.innerHTML < y.innerHTML) {
       
        shouldSwitch= true;
        break;
      }


    }
    //least
    else if(rtype==4){

        x = rows[i].getElementsByTagName("TD")[3];
        y = rows[i + 1].getElementsByTagName("TD")[3];
      
        if (x.innerHTML > y.innerHTML) {
       
        shouldSwitch= true;
        break;
      }


    }

   }  


    if (shouldSwitch) {
      
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}





      //displaying maps
      var panorama;
      function initMap1(name, place) {

        var astorPlace = {lat: latitude, lng: longitude};
       
        var directionsService = new google.maps.DirectionsService;
        var directionsDisplay = new google.maps.DirectionsRenderer;
        var map = new google.maps.Map(document.getElementById('map1'), {
          zoom: 14,
          center: {lat: latitude, lng: longitude},
         
          streetViewControl: false
        });
    
        var marker = new google.maps.Marker({
        position: {lat: latitude, lng: longitude},
        map: map
       
        });  

        marker.setMap(map); 
        
        calculateAndDisplayRoute(directionsService, directionsDisplay, place); 
        
        var onChangeHandler = function() {
          calculateAndDisplayRoute(directionsService, directionsDisplay, name);
        };
        
        document.getElementById('mode').addEventListener('change', function() {
          calculateAndDisplayRoute(directionsService, directionsDisplay, place);
        });

        var hideShowBtn = document.getElementById('directions');
        google.maps.event.addDomListener(hideShowBtn, 'click', hideShowPath);


        function hideShowPath() {
        if (directionsDisplay.getMap()) {
            
            directionsDisplay.setMap(null);
            marker.setMap(map);
             directionsDisplay.setPanel(null);

        } else {
            directionsDisplay.setMap(map);
            marker.setMap(null);
            directionsDisplay.setPanel(document.getElementById('infoPanel'));
        }
       }  




        panorama = map.getStreetView();
        panorama.setPosition(astorPlace);
        panorama.setPov(/** @type {google.maps.StreetViewPov} */({
        heading: 265,
        pitch: 0
        }));


      }

      function calculateAndDisplayRoute(directionsService, directionsDisplay, place) {
       
        placeD = place.formatted_address;

        document.getElementById('to').defaultValue = place.name+" "+placeD;
        document.getElementById("to").readOnly = true;   

        if(location1.length!=0)
        {
          initial = location1;
          document.getElementById('for').defaultValue = location1;
          initial = document.getElementById('for').value;
          initAutocomplete(document.getElementById('for').id);
         
        }
        else
        {  
          initial = new google.maps.LatLng(lat,lng);
          document.getElementById('for').defaultValue = "My Location";
          initAutocomplete(document.getElementById('for').id);

        }

        selectedMode = document.getElementById('mode').value;
      
        directionsService.route({
        
        origin: initial,
        
        destination: placeD,
        provideRouteAlternatives: true,
          
        travelMode: google.maps.TravelMode[selectedMode]
        }, function(response, status) {
        if (status === 'OK') {
          directionsDisplay.setDirections(response);
        } else {
          window.alert('Directions request failed due to ' + status);
        }
        });
      }

     function toggleStreetView() {
     var toggle = panorama.getVisible();
     if (toggle == false) {
     panorama.setVisible(true);
     document.getElementById("showup").innerHTML = '<img src="http://cs-server.usc.edu:45678/hw/hw8/images/Map.png" height=30px width=30px>';


     } else {
    panorama.setVisible(false);
    document.getElementById("showup").innerHTML = '<img src="http://cs-server.usc.edu:45678/hw/hw8/images/Pegman.png" height=30px width=30px>';
    }
   } 


//Implementing favorites using local storage
function Favstorage(id)
{
  
    id = id.className;
    id1 = id;
    id = id.substring(0,id.indexOf("star"));

    if($("."+id1+" #"+id+"123").hasClass("glyphicon glyphicon-star-empty"))
    {
       $("."+id1+" #"+id+"123").removeClass("glyphicon glyphicon-star-empty").addClass("glyphicon glyphicon-star yellow");
       if (typeof(Storage) !== "undefined") {
       
          
          listOfFavorites1=[];
          
          listOfFavorites1.push(document.getElementById(id+"count").innerHTML);
          listOfFavorites1.push(document.getElementById(id+"icon").innerHTML);
          listOfFavorites1.push(document.getElementById(id+"place").innerHTML);
          listOfFavorites1.push(document.getElementById(id+"address").innerHTML);
          listOfFavorites1.push('<span class="glyphicon glyphicon-trash"></span>');
          listOfFavorites1.push(document.getElementById(id).innerHTML);

          localStorage.setItem(id, JSON.stringify(listOfFavorites1));
          
       } 
    }
   

    else if($("."+id1+" #"+id+"123").hasClass("glyphicon glyphicon-star yellow"))
    {
      $("."+id1+" #"+id+"123").removeClass("glyphicon glyphicon-star yellow").addClass("glyphicon glyphicon-star-empty");
      
      localStorage.removeItem(id); 
      $(id).parent().remove();

    }

}

    html_text1 = '';
    p='';
    function Favstoragedisplay()
    {
      if(localStorage.length==0)
      {
          html_text1 = '<div style="margin-top:120px" class="alert alert-warning" role="alert">No Records</div>';
      }
      else{ 
      html_text1 = '';
      var archive = [];
      html_text1 += '<table id = "myTable" class="table table-bordered table-hover" style="font-size:14px; width:100%;">';
      html_text1 += '<tr><th>#</th>';
      html_text1 += '<th>Category</th>';
      html_text1 += '<th class="col-sm-6 col-md-6 col-lg-6">Name</th>';
      html_text1 += '<th class="col-sm-6 col-md-6 col-lg-6">Address</th>';
      html_text1 += '<th>Favorite</th>';
      html_text1 += '<th>Details</th></tr>';
      
      
     
      for (var i = 0; i<localStorage.length; i++)
      {
      archive[i] = localStorage.getItem(localStorage.key(i));          
      a = JSON.parse(archive[i]);             
      p = localStorage.key(i);
      j=i+1;
      html_text1 += '<tr><td>'+j+'</td>';
      html_text1 += '<td>'+a[1]+'</td>';
      html_text1 += '<td>'+a[2]+'</td>';
      html_text1 += '<td>'+a[3]+'</td>';
      html_text1 += '<td class="deleteButton" id ="'+p+'">'+a[4]+'</td>';
      html_text1 += '<td id = "'+p+"apple"+'" onclick="initMap(id)">'+a[5]+'</td></tr>';
                
      }
     
      html_text1 += '</table>';
     } 
      $("#results").html(html_text1);     

    
  }

    $(document).on("click",".deleteButton",function(e){
      
      var rowId = this.id;  
      localStorage.removeItem(rowId);
      $(this).parent().remove();

    });












 
    