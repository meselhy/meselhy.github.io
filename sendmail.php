<?php

class Email{

    private $m_sName;
    private $m_sEmail;
    private $m_sMessage;

    public function __set($p_sProperty, $p_vValue){
        switch($p_sProperty){

            case 'Name':
                if($p_vValue != '') {
                    $this->m_sName = $p_vValue;
                }
                else{
                    throw new Exception("No name found");
                }
                break;

            case 'Email':
            if($p_vValue != '') {
                    $this->m_sEmail = $p_vValue;
                }
                else{
                    throw new Exception("No email adress found");
                }
                break;

            case 'Message':
                if($p_vValue != '') {
                    $this->m_sMessage = $p_vValue;
                }
                else{
                    throw new Exception("No message found");
                }
                break;
        }
    }

    public function __get($p_sProperty){
        switch($p_sProperty){
            case 'Name':
                return $this->m_sName;
                break;

            case 'Email':
                return $this->m_sEmail;
                break;

            case 'Message':
                return $this->m_sMessage;
                break;
        }
    }

    public function Send(){

        $email_to = "hello@meselhy.dev";
        $email_subject = "Message from  ".$this->m_sName;

        $email_message = "Name: ".$this->m_sName."\n";
        $email_message .= "Email: ".$this->m_sEmail."\n";
        $email_message .= "Message: ".$this->m_sMessage."\n";

        $headers = 'From: '.$this->m_sEmail."\r\n".
        'Reply-To: '.$this->m_sEmail."\r\n" .
        'X-Mailer: PHP/' . phpversion() . 
        'IP-Address: ' . $_SERVER['REMOTE_ADDR'];

        $success = mail($email_to, $email_subject, $email_message, $headers);

        if ($success) {
            echo "Thank you ".$this->m_sName." for your message, I will be in touch with you shortly";
        } else { 
            echo "Message failed. Please, try again";
        }

    }

}

?>