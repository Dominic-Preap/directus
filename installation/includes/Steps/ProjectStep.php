<?php

namespace Directus\Installation\Steps;

class ProjectStep extends AbstractStep
{
    protected $number = 1;
    protected $name = 'project';
    protected $title = 'Project Info';
    protected $shortTitle = 'Project';
    protected $viewName = 'project.php';
    protected $fields = [
        [
            'name' => 'directus_name',
            'label' => 'Project Name',
            'rules' => 'required'
        ],
        [
            'name' => 'directus_path',
            'label' => 'Project Path',
            'rules' => 'required'
        ],
        [
            'name' => 'directus_email',
            'label' => 'Project Email',
            'rules' => 'required|email'
        ],
        [
            'name' => 'directus_password',
            'label' => 'Project Password',
            'rules' => 'required|min:6'
        ],
        [
            'name' => 'directus_password_confirm',
            'label' => 'Project Password Confirmation',
            'rules' => 'required|match[directus_password]'
        ]
    ];
}
