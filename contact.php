<?php

include_once('sendmail.php');

if(isset($_POST['email'])){
    try {
        $e = new Email();
        $e->Name = $_POST['name'];
        $e->Email = $_POST['email'];
        $e->Message = $_POST['message'];
        $e->Send();
    }

    catch(Exception $e){
        echo $error = $e->getMessage();
    }
} else {
    echo '<h1 style="text-align: center;margin-left: auto;margin-right: auto;margin-top: 50vh;font-family:monospace;">';
    echo "Hey Human, I'm smarter than your mom's vagina production!</h1>";
}

if(isset($error)){
    echo $error;
}
?>