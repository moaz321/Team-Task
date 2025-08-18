variable "aws_region" {
   description = "AWS region"
   type = string
}

variable "prefix" {
  description = "Resource prefix"
  type = string
}

variable "instance_type" {
  description = "EC2 size"
  type = string
}

variable "ami_id" {
  description = "AMI ID"
  type = string
}

variable "key_name" {
  description = "Key pair"
  type = string
}
