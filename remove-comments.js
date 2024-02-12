$(document).ready(function() {

   //Initialize Global Variables
   var code = "", extension = "", new_text = "", output = "";
    
    //Dark or Light Mode on WebApp
   function colormode() {
      var element = document.body;
      element.dataset.bsTheme = element.dataset.bsTheme == "light" ? "dark" : "light";
   }

   // Creates a hidden button which is used to download the output file
   function createFile(code) {

      var file = new File(["\ufeff" + code], 'output' + (extension ? '.' + extension : '.txt'), { type: "text/plain;charset=UTF-8" });
      var url = URL.createObjectURL(file), a = Object.assign(document.createElement("a"), { style: "display: none", href: url, download: file.name });
      a.click(), URL.revokeObjectURL(url);

   }

   function findInvalidComments(code) {
      var error_ln = [];
      const invalidMultiLineRegex = /\/\*[^*]*$/gm; // Matches invalid-opened multi-line comments
      const invalidSingleLineRegex = /(?<=\s)\/(?![/*])/gs;// Matches invalid single-line comments
      
      let invalidComments = [];

      // Check for invalid-opened multi-line comments
      let match;
      while ((match = invalidMultiLineRegex.exec(code)) !== null) {
         invalidComments.push({
            line: getLineNumber(code, match.index),
            type: 'invalid-multi-line',
            position: 'opening',
            in_comment: match[0]
         });
      }

      // Check for invalid-closed multi-line comments
      const invalidClosedMultiLineRegex = /\*\/(?!\/)/gm; // Matches invalid-closed multi-line comments
      while ((match = invalidClosedMultiLineRegex.exec(code)) !== null) {
         invalidComments.push({line: getLineNumber(code, match.index), type: 'invalid-multi-line', in_comment: match[0]});
      }

      // Check for invalid single-line comments
      while ((match = invalidSingleLineRegex.exec(code)) !== null) {
         invalidComments.push({ line: getLineNumber(code, match.index), type: 'invalid-single-line', in_comment: match[0]
         });
      }
      
      if (invalidComments.length > 0) {
         $(".result,.error,#invalid-btn").removeClass("hidden");
         $("p.invalid-comment").text("All Valid Comments Removed & Invalid Comments Found");

         invalidComments.forEach(comment => {
            $(".invalid-comments").append(`<p><span class="incomment">${comment.in_comment}</span> found invalid comment at <span class="incomment">line ${comment.line}</span></p>`);
         });
      } else {
         $(".result").removeClass("hidden");
         $("p.invalid-comment").text("All Valid Comments Removed No Invalid Comments Found");

      }
   }

   function getLineNumber(code, index) {
      return code.substr(0, index).split('\n').length;
   }

   $('#upload').on('input', function() {
      const file = this.files[0]
      // File reader
      let fr = new FileReader()

      fr.readAsText(file);
      //to get files Extension
      extension = file.name.split('.').pop();

      fr.onload = () => {
         code = fr.result;
         $("code-input#main-code").val(fr.result);
      }

      fr.onerror = () => {
         console.log(fr.error)
      }

   });
    
    /* Function to find Js valid comments */
   function jsFindValidComments(ccode) {
      try {
         // Main code
         output = ccode.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');
         return output;
         
      } catch (error) {
         console.error("An error occurred:", error);
      }
   }
   
    /* Function to call PHP Function */
   function phpFindValidComments(ccode) {
      try {
         $.ajax({
            type: "POST",
            url: 'remove-comments.php',
            dataType: 'json',
            data: {
               code: ccode
            },
            success: function(response) {
               output = response;
               $("#error").html(output.inv_comment);
               $("#output-code").val(output.pcode);
            }
         });

         // Enables the download buttons
         $('.download').prop("disabled", false);
         $(".result,.error,#invalid-btn").removeClass("hidden");
      } catch (error) {
         console.error("An error occurred:", error);
      }
   }
    
/* Remove Valid Comments and FUnd Invalid Comments in Program*/
   $("#remove-comment").click(function() {
      try {
          $(".invalidComments").text("");
         let code = $("code-input#main-code").val();
         let type = $(".form-select option:selected").val();

         if (type === "js") {
            output = jsFindValidComments(code);
            findInvalidComments(output);
            $("#output-code").val(output);
            $('.download').prop("disabled", false);
         } else {
            phpFindValidComments(code);
         }
      } catch (error) {
         console.error("An error occurred:", error);
      }
   });
    
    /* calls the download file function */
   $(document).on('click', '.download', function() {
      createFile(output);
   });

});