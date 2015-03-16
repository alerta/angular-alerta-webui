%{!?_with_teamcity: %define version 3.0.0}
%{!?_with_teamcity: %define release 1}

%define prefix /var/www/alerta

Name: alerta-webui
Summary: Alerta WebUI
Version: %{version}
Release: %{release}
Source0: %{name}-%{version}.tar.gz
License: Apache License 2.0
Group: Utilities/System
BuildRoot: %{_tmppath}/%{name}-%{version}-%{release}-buildroot
Prefix: %{prefix}
BuildArch: noarch
Vendor: Nick Satterly <nick.satterly@theguardian.com>
Url: https://github.com/alerta/angular-alerta-webui
Requires: httpd, alerta-server

%description
Alerta Web UI is the frontend for the Alerta monitoring system.

%prep
%setup -q

%install
%__mkdir_p %{buildroot}%{prefix}
cp -r %{_builddir}/%{name}-%{version}/app/* %{buildroot}%{prefix}

%__mkdir_p %{buildroot}%{_sysconfdir}/httpd/conf.d/
cat > %{buildroot}%{_sysconfdir}/httpd/conf.d/alerta-webui.conf << EOF
<VirtualHost *:80>
  ProxyPass /api http://localhost:8080
  ProxyPassReverse /api http://localhost:8080
  DocumentRoot %{prefix}
</VirtualHost>
EOF

%clean
rm -rf %{buildroot}

%files
%defattr(-,root,root)
%config(noreplace) %{_sysconfdir}/httpd/conf.d/alerta-webui.conf
%config(noreplace) %{prefix}/config.js
%{prefix}

%changelog
* Thu Mar 12 2015 Nick Satterly <nick.satterly@theguardian.com> - 3.0.0-1
- Update RPM SPEC file for Release 3