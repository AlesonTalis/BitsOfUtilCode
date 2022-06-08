<?php
// loading tests
class LoadingTime
{
    var $fileloc = "";
    var $timers = [];

    var $file = null;
    var $init = 0;

    function __construct()
    {
        $this->createFile();
        $this->init = $this->startTimer('AllFunctions');
    }

    function __destruct()
    {
        $this->endTimer($this->init);

        $this->saveLog();

        fclose($this->file);
    }

    function createFile()
    {
        $num = rand(0, 1000000);
        $datenow = $this->getDateNow();
        
        $text = "LOG CARREGAMENTO\n$datenow\n\n";

        $this->fileloc = dirname(__FILE__).'/'.$datenow.'.'.$num.'.log';

        $this->file = fopen($this->fileloc,'a+');

        fwrite($this->file, $text);
    }

    function startTimer($funcName = "")
    {
        $ind = count($this->timers);

        $init = microtime(true);

        $this->timers[$ind] = array(
            $funcName,
            $init
        );

        return $ind;
    }

    function endTimer($ind = -1)
    {
        $end = microtime(true);
        array_push($this->timers[$ind], $end);

        $t1 = $this->timers[$ind][1];
        $t2 = $this->timers[$ind][2];

        // $time = floor(($t2 - $t1) * 1000);
        $time = $t2 - $t1;

        array_push($this->timers[$ind], $time);

        // $this->writeToFile($text);
    }

    function getDateNow()
    {
        $date = new DateTime();
        return $date->format('Y-m-d-H-i-s');
    }

    function writeToFile($text)
    {
        fwrite($this->file, $text."\n");
    }

    function saveLog()
    {
        $text = "";

        // $text .= join("\n\t", $_SERVER) + "\n";

        foreach ($this->timers as $key => $value) {
            if (count($value) === 3)
            {
                $nm = $value[0];
                $ru = $value[3];
                $t1 = $this->getDateTime($value[1]);
                $t2 = $this->getDatetime($value[2]);

                $text .= "LOG: ($nm) -> [$t1 | $t2] $ru\n";
            }
        }

        $this->writeToFile($text);//.join("\n\t", $_SERVER));
    }

    function getDateTime($t)
    {
        $micro = sprintf("%06d", ($t - floor($t)) * 1000000);
        $d = new Datetime(date('Y-m-d H:i:s.'.$micro, $t));
        return $d->format('Y-m-d H:i:s.u');
    }
}

function generateCallTrace()
{
    $e = new Exception();
    $trace = explode("\n", $e->getTraceAsString());
    // reverse array to make steps line up chronologically
    $trace = array_reverse($trace);
    array_shift($trace); // remove {main}
    array_pop($trace); // remove call to this method
    $length = count($trace);
    $result = array();
   
    for ($i = 0; $i < $length; $i++)
    {
        $result[] = ($i + 1)  . ')' . substr($trace[$i], strpos($trace[$i], ' ')); // replace '#someNum' with '$i)', set the right ordering
    }
   
    return "\t" . implode("\n\t", $result);
}

global $TM;

$TM = new LoadingTime();

// $id = $TM->startTimer('functionInit');
