<?php if ($step->getResponse() && $step->getResponse()->getWarnings()): ?>
    <h3>Warnings:</h3>
    <?php foreach($step->getResponse()->getWarnings() as $message): ?>
        <p><em><?=$message?></em></p>
    <?php endforeach; ?>
<?php endif; ?>
