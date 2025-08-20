
provider "aws" {
  region = var.aws_region
}

data "aws_availability_zones" "available" {}

# I Used Terraform AWS VPC module instead of manually creating VPC, Subnet, IGW, Route Table
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = var.prefix
  cidr = "10.0.0.0/16"

  azs            = slice(data.aws_availability_zones.available.names, 0, 1)
  public_subnets = ["10.0.1.0/24"]

  enable_nat_gateway   = false
  enable_dns_hostnames = true
  map_public_ip_on_launch = true
}

# Security Group
resource "aws_security_group" "sg" {
  name        = "${var.prefix}-sg"
  description = "Allow SSH and HTTP"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# EC2 Instance
resource "aws_instance" "vm" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  subnet_id              = module.vpc.public_subnets[0]
  vpc_security_group_ids = [aws_security_group.sg.id]
  key_name               = var.key_name
  user_data_base64       = base64encode(file("${path.module}/init.sh"))

  tags = { Name = "${var.prefix}-vm" }
}

output "public_ip" {
  value = aws_instance.vm.public_ip
}

