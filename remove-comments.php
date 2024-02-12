<?php

    try {
        // Get the code from POST request
        $program = $_POST['code'];
    
        // Function to remove comments
        function removeComments($str) {
            // Remove single line comments
            $str = preg_replace('/\/\/.*$/m', '', $str);
            
            // Remove multi-line comments
            $str = preg_replace('/\/\*.*?\*\//s', '', $str);
            
            return $str;
        }
        
        function findHalfComments($code) {
            $error_ln = [];
            $halfComments = [];
            $output = ''; // Initialize output variable
            
            // Define regular expressions
            $halfMultiLineRegex = '/\/\*[^*]*$/m'; // Matches half-opened multi-line comments
            $halfSingleLineRegex = '/(?<=\s)\/(?![/])/m'; // Matches half single-line comments
            
            // Check for half-opened multi-line comments
            preg_match_all($halfMultiLineRegex, $code, $multiLineMatches, PREG_OFFSET_CAPTURE);
            foreach ($multiLineMatches[0] as $match) {
                $halfComments[] = [
                    'line' => getLineNumber($code, $match[1]),
                    'type' => 'half-multi-line',
                    'in_comment' => $match[0]
                ];
            }
            
            // Check for half-closed multi-line comments
            $halfClosedMultiLineRegex = '/\*\/(?!\/)/m'; // Matches half-closed multi-line comments
            preg_match_all($halfClosedMultiLineRegex, $code, $closedMultiLineMatches, PREG_OFFSET_CAPTURE);
            foreach ($closedMultiLineMatches[0] as $match) {
                $halfComments[] = [
                    'line' => getLineNumber($code, $match[1]),
                    'type' => 'half-multi-line',
                    'in_comment' => $match[0]
                ];
            }
            
            // Check for half single-line comments
            preg_match_all($halfSingleLineRegex, $code, $singleLineMatches, PREG_OFFSET_CAPTURE);
            foreach ($singleLineMatches[0] as $match) {
                $halfComments[] = [
                    'line' => getLineNumber($code, $match[1]),
                    'type' => 'half-single-line',
                    'in_comment' => $match[0]
                ];
            }
            
            if (!empty($halfComments)) {
               
                $output .= '<h2>Invalid Comments after removing Valid Comments</h2>';
                
                foreach ($halfComments as $comment) {
                    $output .= '<p><span class="incomment">' . $comment['in_comment'] . '</span> found at ' . ($comment['position'] === 'opening' ? 'opening' : 'closing') . ' comment at <span class="incomment">line ' . $comment['line'] . '</span></p>';
                }
                
            } else {
                
                $output .= '<h2>No Invalid Comments Found</h2>';
                $output .= '<p class="invalid-comment">All Valid Comments Removed No Invalid Comments Found</p>';
                
            }
            
            return $output; // Return the generated output
        }

        
        function getLineNumber($code, $index) {
            return substr_count(substr($code, 0, $index), "\n") + 1;
        }

        // Print the code with comments removed
        
        $code = removeComments($program);
        $invalid = findHalfComments($code);
        
        $return['pcode'] = $code;
        $return['inv_comment'] = $invalid;
        
        print_r(json_encode($return));
        
        
    } catch (Exception $e) {
        // Handle any exceptions
        echo 'Error: ',  $e->getMessage(), "\n";
    }

?>