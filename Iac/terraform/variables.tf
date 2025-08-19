variable "aws_region" {
  default = "us-east-1"
}

variable "prefix" {
  default = "team-tasks"
}

variable "instance_type" {
  default = "t2.micro"
}

variable "ami_id" {
  description = "Ubuntu 22.04 AMI"
}

variable "key_name" {
  description = "Existing AWS key pair name"
}

